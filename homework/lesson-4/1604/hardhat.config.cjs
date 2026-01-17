require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
          viaIR: false,
        },
      },
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
          viaIR: false,
        },
      },
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
          viaIR: false,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 100000000,
  },
  networks: {
    hardhat: {
      // Standard hardhat network
    }
  },
};