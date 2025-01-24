import { HardhatUserConfig, task } from "hardhat/config";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";

require('dotenv').config()
  
const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.api.onfinality.io/public',
      accounts: ['e01d80ad71ad2a5ba1f055e325c8cb73d8b169775a4086035d01799e7ca141e4', '5f00a94a5ea03fe9272e6f04b5c517297bde4d4ead2d7b1af443971dff2049f1'],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: 'WDEIINZHN7I2XNZ19NHK7ME1J54JHRQBBJ',  
      arbitrum_l2: "abcxzy",
      conduit:  "abcxzy",
    },
    customChains: [
      {
        network: "arbitrum_l2",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
      {
        network: "conduit",
        chainId: 96835,
        urls: {
          apiURL: "https://explorer-pmtest-6lw45cjbgl.t.conduit.xyz/api",
          browserURL: "https://explorer-pmtest-6lw45cjbgl.t.conduit.xyz/"
        }
      }
    ],
  },
  ignition: {
    requiredConfirmations: 1,
  },
  sourcify: {
    enabled: false
  }
};

export default config;
