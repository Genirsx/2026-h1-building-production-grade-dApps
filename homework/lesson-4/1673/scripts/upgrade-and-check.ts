import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { join } from "path";

const rpcUrl = process.env.POLKADOT_HUB_RPC_URL;
const privateKey = process.env.POLKADOT_HUB_PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
    throw new Error("POLKADOT_HUB_RPC_URL and POLKADOT_HUB_PRIVATE_KEY are required");
}

const chain = {
    id: 420420417,
    name: "Polkadot Hub Test",
    nativeCurrency: { name: "DOT", symbol: "DOT", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
} as const;

const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
});

const account = privateKeyToAccount(privateKey as `0x${string}`);
const walletClient = createWalletClient({
    chain,
    account,
    transport: http(rpcUrl),
});

const proxyAddress = process.env.PROXY_ADDRESS as `0x${string}` | undefined;
if (!proxyAddress) {
    throw new Error("PROXY_ADDRESS is required");
}

// Load ABIs from artifacts
const v1AbiPath = join(process.cwd(), "artifacts/contracts/UpgradableContract.sol/UpgradableContract.json");
const v2AbiPath = join(process.cwd(), "artifacts/contracts/UpgradableContract.sol/UpgradableContractV2.json");
const v1Artifact = JSON.parse(readFileSync(v1AbiPath, "utf-8"));
const v2Artifact = JSON.parse(readFileSync(v2AbiPath, "utf-8"));

let before = {
    name: await publicClient.readContract({
        address: proxyAddress,
        abi: v1Artifact.abi,
        functionName: "name",
    }),
    value: await publicClient.readContract({
        address: proxyAddress,
        abi: v1Artifact.abi,
        functionName: "value",
    }),
    version: await publicClient.readContract({
        address: proxyAddress,
        abi: v1Artifact.abi,
        functionName: "version",
    }),
};

if ((before.version as bigint) === 0n && before.name === "" && (before.value as bigint) === 0n) {
    console.log("Initializing V1...");
    const initTx = await walletClient.writeContract({
        address: proxyAddress,
        abi: v1Artifact.abi,
        functionName: "initialize",
        args: ["V1", 1n],
    });
    await publicClient.waitForTransactionReceipt({ hash: initTx });
    before = {
        name: await publicClient.readContract({
            address: proxyAddress,
            abi: v1Artifact.abi,
            functionName: "name",
        }),
        value: await publicClient.readContract({
            address: proxyAddress,
            abi: v1Artifact.abi,
            functionName: "value",
        }),
        version: await publicClient.readContract({
            address: proxyAddress,
            abi: v1Artifact.abi,
            functionName: "version",
        }),
    };
}

console.log("Before upgrade:", before);

// Deploy V2 implementation
console.log("Deploying V2 implementation...");
const v2ImplTxHash = await walletClient.deployContract({
    abi: v2Artifact.abi,
    bytecode: v2Artifact.bytecode as `0x${string}`,
});

const v2ImplReceipt = await publicClient.waitForTransactionReceipt({ hash: v2ImplTxHash });
const v2ImplAddress = v2ImplReceipt.contractAddress;
if (!v2ImplAddress) {
    throw new Error("Failed to deploy V2 implementation");
}
console.log("V2 implementation deployed at:", v2ImplAddress);

// Upgrade proxy to V2
console.log("Upgrading proxy to V2...");
const upgradeTx = await walletClient.writeContract({
    address: proxyAddress,
    abi: v1Artifact.abi,
    functionName: "upgradeToAndCall",
    args: [v2ImplAddress, "0x"],
});
const upgradeTxReceipt = await publicClient.waitForTransactionReceipt({ hash: upgradeTx });
console.log("Upgrade tx:", upgradeTx);

// Initialize V2
console.log("Initializing V2...");
const initV2Tx = await walletClient.writeContract({
    address: proxyAddress,
    abi: v2Artifact.abi,
    functionName: "initializeV2",
});
const initV2TxReceipt = await publicClient.waitForTransactionReceipt({ hash: initV2Tx });
console.log("InitializeV2 tx:", initV2Tx);

// Read V2 storage
const after = {
    name: await publicClient.readContract({
        address: proxyAddress,
        abi: v2Artifact.abi,
        functionName: "name",
    }),
    value: await publicClient.readContract({
        address: proxyAddress,
        abi: v2Artifact.abi,
        functionName: "value",
    }),
    version: await publicClient.readContract({
        address: proxyAddress,
        abi: v2Artifact.abi,
        functionName: "version",
    }),
    newValue: await publicClient.readContract({
        address: proxyAddress,
        abi: v2Artifact.abi,
        functionName: "newValue",
    }),
    newFeatureEnabled: await publicClient.readContract({
        address: proxyAddress,
        abi: v2Artifact.abi,
        functionName: "newFeatureEnabled",
    }),
};

console.log("\n=== AFTER UPGRADE ===");
console.log("After upgrade:", after);
console.log("\n=== DEPLOYMENT & UPGRADE RESULTS ===");
console.log("Proxy address:", proxyAddress);
console.log("V2 implementation address:", v2ImplAddress);
console.log("Upgrade tx hash:", upgradeTx);
console.log("InitializeV2 tx hash:", initV2Tx);
console.log("\n=== STORAGE COMPARISON ===");
console.log("Before:", before);
console.log("After:", after);
console.log("\n=== CHANGES ===");
console.log("name (unchanged):", before.name === after.name ? "✓" : "✗");
console.log("value (unchanged):", (before.value as bigint) === (after.value as bigint) ? "✓" : "✗");
console.log("version (changed V1→V2):", (before.version as bigint) === 1n && (after.version as bigint) === 2n ? "✓" : "✗");
console.log("newValue (new):", after.newValue);
console.log("newFeatureEnabled (new):", after.newFeatureEnabled);
