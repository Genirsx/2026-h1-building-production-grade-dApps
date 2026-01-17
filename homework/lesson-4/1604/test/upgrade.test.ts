import { expect } from "chai";
import { ethers } from "hardhat";
import { UpgradableContractV1, UpgradableContractV2 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Upgrade from V1 to V2", function () {
  let v1Contract: UpgradableContractV1;
  let v2Contract: UpgradableContractV2;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy V1 contract
    const V1Factory = await ethers.getContractFactory("UpgradableContractV1");
    v1Contract = await ethers.upgrades.deployProxy(
      V1Factory,
      ["V1Contract", 100],
      { initializer: "initialize" }
    ) as UpgradableContractV1;
    await v1Contract.deployed();

    // Verify V1 is working correctly
    expect(await v1Contract.name()).to.equal("V1Contract");
    expect(await v1Contract.value()).to.equal(100);
  });

  it("Should upgrade from V1 to V2 and maintain state", async function () {
    // Save current state from V1
    const currentValue = await v1Contract.value();
    const currentName = await v1Contract.name();

    // Deploy V2 implementation
    const V2Factory = await ethers.getContractFactory("UpgradableContractV2");
    const v2Impl = await V2Factory.deploy();
    await v2Impl.deployed();

    // Perform the upgrade from V1 to V2
    await v1Contract.upgradeTo(v2Impl.address);
    
    // Cast the contract to V2 to access V2 functions
    const upgradedContract = V2Factory.attach(v1Contract.address) as UpgradableContractV2;
    
    // Check that state from V1 is preserved
    expect(await upgradedContract.value()).to.equal(currentValue);
    expect(await upgradedContract.name()).to.equal(currentName);
    
    // Verify V2-specific features are available
    expect(await upgradedContract.newFeatureEnabled()).to.equal(false); // Will be false since initializeV2 wasn't called
    
    // Initialize V2 features
    await upgradedContract.initializeV2();
    expect(await upgradedContract.newFeatureEnabled()).to.equal(true);
    
    // Test V2-specific functionality
    await upgradedContract.setNewValue(200);
    expect(await upgradedContract.newValue()).to.equal(200);
  });

  it("Should test the complete upgrade flow with initialization", async function () {
    // Set values in V1
    await v1Contract.setValue(500);
    await v1Contract.setName("UpgradedContract");
    
    // Deploy V2 implementation
    const V2Factory = await ethers.getContractFactory("UpgradableContractV2");
    const v2Impl = await V2Factory.deploy();
    await v2Impl.deployed();

    // Perform the upgrade
    await v1Contract.upgradeTo(v2Impl.address);
    
    // Cast to V2
    const upgradedContract = V2Factory.attach(v1Contract.address) as UpgradableContractV2;
    
    // Check V1 state preservation
    expect(await upgradedContract.value()).to.equal(500);
    expect(await upgradedContract.name()).to.equal("UpgradedContract");
    
    // Initialize V2 features (this is a re-initializer, not initial)
    await upgradedContract.initializeV2();
    expect(await upgradedContract.newFeatureEnabled()).to.equal(true);
    
    // Test both V1 and V2 functionality on the same contract
    await upgradedContract.setValue(999);
    expect(await upgradedContract.value()).to.equal(999);
    
    await upgradedContract.setName("PostUpgradeName");
    expect(await upgradedContract.name()).to.equal("PostUpgradeName");
    
    await upgradedContract.setNewValue(1234);
    expect(await upgradedContract.newValue()).to.equal(1234);
  });

  it("Should ensure V1 initializer is disabled after upgrade to V2", async function () {
    // Deploy V2 implementation
    const V2Factory = await ethers.getContractFactory("UpgradableContractV2");
    const v2Impl = await V2Factory.deploy();
    await v2Impl.deployed();

    // Perform the upgrade
    await v1Contract.upgradeTo(v2Impl.address);
    
    // Cast to V2
    const upgradedContract = V2Factory.attach(v1Contract.address) as UpgradableContractV2;
    
    // Attempting to call the V1 initializer should fail
    await expect(upgradedContract.initialize("TestName", 42))
      .to.be.revertedWith("Use V1 initializer only");
  });
});