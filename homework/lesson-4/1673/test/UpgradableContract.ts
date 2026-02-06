import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("UpgradableContract (UUPS)", async function () {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();

    it("deploys proxy, upgrades, and preserves storage", async function () {
        const v1Impl = await viem.deployContract("UpgradableContract");
        const proxy = await viem.deployContract("OZERC1967Proxy", [v1Impl.address, "0x"]);

        const proxyAsV1 = await viem.getContractAt("UpgradableContract", proxy.address);
        await proxyAsV1.write.initialize(["V1", 7n]);

        assert.equal(await proxyAsV1.read.name(), "V1");
        assert.equal(await proxyAsV1.read.value(), 7n);
        assert.equal(await proxyAsV1.read.version(), 1n);

        const v2Impl = await viem.deployContract("UpgradableContractV2");
        const upgradeTx = await proxyAsV1.write.upgradeToAndCall([v2Impl.address, "0x"]);
        await publicClient.waitForTransactionReceipt({ hash: upgradeTx });

        const proxyAsV2 = await viem.getContractAt("UpgradableContractV2", proxy.address);
        await proxyAsV2.write.initializeV2();

        assert.equal(await proxyAsV2.read.name(), "V1");
        assert.equal(await proxyAsV2.read.value(), 7n);
        assert.equal(await proxyAsV2.read.version(), 2n);
        assert.equal(await proxyAsV2.read.newFeatureEnabled(), true);
    });
});
