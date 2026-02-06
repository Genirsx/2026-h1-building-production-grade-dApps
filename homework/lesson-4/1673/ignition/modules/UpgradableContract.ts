import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UpgradableContractModule", (m) => {
    const implementation = m.contract("UpgradableContract");
    const proxy = m.contract("OZERC1967Proxy", [implementation, "0x"]);

    const proxyAsV1 = m.contractAt("UpgradableContract", proxy, {
        id: "UpgradableContractProxy",
    });
    m.call(proxyAsV1, "initialize", ["V1", 1n]);

    return { implementation, proxy, proxyAsV1 };
});
