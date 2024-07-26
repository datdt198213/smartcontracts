import { HardhatUserConfig, task } from "hardhat/config";
import '@openzeppelin/hardhat-upgrades';
import "hardhat-contract-sizer";

require('dotenv').config()

import "./scripts/tasks/deploy.ts";
import "./scripts/tasks/gen.ts";
import "./scripts/tasks/mint.ts";
import "./scripts/tasks/transfer.ts";
import "./scripts/tasks/xferEth.ts";

  
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  settings: {
    viaIR: true,
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    conduit: {
      url: 'https://rpc-pmtest-6lw45cjbgl.t.conduit.xyz',
      accounts: [''],
    },
    arbitrum_l2: {
      //url: 'https://sepolia-rollup.arbitrum.io/rpc',
	  url: 'http://3.139.144.111:8547',
      accounts: [''],
	},
  },
  etherscan: {
    apiKey: {
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
