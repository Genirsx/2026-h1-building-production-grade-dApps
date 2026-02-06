import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC1673Module", (m) => {
    const erc1673 = m.contract("ERC1673");

    return { erc1673 };
});
