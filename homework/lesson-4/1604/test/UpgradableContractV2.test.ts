import { expect } from "chai";
import { ethers } from "hardhat";
import { UpgradableContractV2 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("UpgradableContractV2", function () {
  let contract: UpgradableContractV2;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy the implementation contract and initialize with V2
    const ContractFactory = await ethers.getContractFactory("UpgradableContractV2");
    contract = await ethers.upgrades.deployProxy(
      ContractFactory,
      [], 
      { initializer: false } // Don't initialize with the V1 initializer since it's reverted
    ) as UpgradableContractV2;
    await contract.deployed();

    // Initialize with V2-specific initialization
    await contract.initializeV2();
  });

  it("Should initialize with V2-specific values", async function () {
    expect(await contract.newFeatureEnabled()).to.equal(true);
  });

  it("Should not allow initialization with V1 function", async function () {
    await expect(contract.initialize("Test", 42)).to.be.revertedWith("Use V1 initializer only");
  });

  it("Should allow setting value", async function () {
    await contract.setValue(100);
    expect(await contract.value()).to.equal(100);
  });

  it("Should allow setting name (owner only)", async function () {
    await contract.setName("NewName");
    expect(await contract.name()).to.equal("NewName");
  });

  it("Should not allow non-owner to set name", async function () {
    await expect(contract.connect(addr1).setName("UnauthorizedName"))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should allow setting new value (V2 feature)", async function () {
    await contract.setNewValue(200);
    expect(await contract.newValue()).to.equal(200);
  });

  it("Should have new feature enabled by default", async function () {
    expect(await contract.newFeatureEnabled()).to.equal(true);
  });

  it("Should be upgradeable by owner only", async function () {
    // Deploy another implementation for testing upgrades
    const newImplFactory = await ethers.getContractFactory("UpgradableContractV2");
    const newImpl = await newImplFactory.deploy();
    await newImpl.deployed();

    // Owner should be able to upgrade
    await expect(contract.upgradeToAndCall(newImpl.address, "0x"))
      .to.not.be.reverted;

    // Non-owner should not be able to upgrade
    const contractAsAddr1 = contract.connect(addr1);
    await expect(contractAsAddr1.upgradeToAndCall(newImpl.address, "0x"))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });
});