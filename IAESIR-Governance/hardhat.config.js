require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const EXPLORER_KEY = process.env.EXPLORER_KEY;

const BSC_API_URL = "https://bsc-dataseed.binance.org/";
const BSC_PRIVATE_KEY =
  process.env.BSC_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// const ETHEREUM_API_URL = process.env.ETHEREUM_API_URL;
// const ETHEREUM_PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // paths: {
  //   artifacts: './client/src/artifacts'
  // },
  networks: {
    bsc: {
      url: BSC_API_URL,
      accounts: [BSC_PRIVATE_KEY],
    },
    //   ethereum: {
    //     url: ETHEREUM_API_URL,
    //     accounts: [ETHEREUM_PRIVATE_KEY],
    //   },
  },
  etherscan: {
    apiKey: EXPLORER_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 21,
  },
};
