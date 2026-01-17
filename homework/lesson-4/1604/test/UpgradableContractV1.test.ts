import { expect } from "chai";
import { ethers } from "hardhat";
import { UpgradableContractV1 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("UpgradableContractV1", function () {
  let contract: UpgradableContractV1;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the implementation contract and initialize
    const ContractFactory = await ethers.getContractFactory("UpgradableContractV1");
    contract = await ethers.upgrades.deployProxy(
      ContractFactory,
      ["TestContract", 42],
      { initializer: "initialize" }
    ) as UpgradableContractV1;
    await contract.deployed();
  });

  it("Should deploy with correct initial values", async function () {
    expect(await contract.name()).to.equal("TestContract");
    expect(await contract.value()).to.equal(42);
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should allow setting value", async function () {
    await contract.setValue(100);
    expect(await contract.value()).to.equal(100);
  });

  it("Should allow owner to set name", async function () {
    await contract.setName("NewName");
    expect(await contract.name()).to.equal("NewName");
  });

  it("Should not allow non-owner to set name", async function () {
    await expect(contract.connect(addr1).setName("UnauthorizedName"))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should authorize upgrades only by owner", async function () {
    // Deploy a new implementation
    const newImplFactory = await ethers.getContractFactory("UpgradableContractV1");
    const newImpl = await newImplFactory.deploy();
    await newImpl.deployed();

    // Owner should be able to upgrade
    await expect(contract.upgradeTo(newImpl.address))
      .to.emit(contract, "Upgraded")
      .withArgs(newImpl.address);

    // Non-owner should not be able to upgrade
    const contractAsAddr1 = contract.connect(addr1);
    await expect(contractAsAddr1.upgradeTo(newImpl.address))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should preserve state after upgrade", async function () {
    // Set initial values
    await contract.setValue(999);
    await contract.setName("BeforeUpgrade");

    // Deploy new implementation
    const newImplFactory = await ethers.getContractFactory("UpgradableContractV1");
    const newImpl = await newImplFactory.deploy();
    await newImpl.deployed();

    // Upgrade
    await contract.upgradeTo(newImpl.address);

    // Check that state is preserved
    expect(await contract.value()).to.equal(999);
    expect(await contract.name()).to.equal("BeforeUpgrade");
    expect(await contract.owner()).to.equal(owner.address);
  });
});