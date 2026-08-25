require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const REPORT_GAS = process.env.REPORT_GAS || false;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: { chainId: 31337 },
        localhost: { chainId: 31337 },
        ...(SEPOLIA_RPC_URL
            ? {
                  sepolia: {
                      url: SEPOLIA_RPC_URL,
                      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
                      chainId: 11155111,
                  },
              }
            : {}),
        ...(AMOY_RPC_URL
            ? {
                  amoy: {
                      url: AMOY_RPC_URL,
                      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
                      chainId: 80002,
                  },
              }
            : {}),
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY || "",
            polygonAmoy: POLYGONSCAN_API_KEY || "",
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    namedAccounts: {
        deployer: { default: 0, 1: 0 },
        player: { default: 1 },
    },
    solidity: { compilers: [{ version: "0.8.7" }, { version: "0.4.24" }] },
    mocha: { timeout: 200000 },
};
