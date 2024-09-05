import { HardhatUserConfig, task } from "hardhat/config";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";

require('dotenv').config()

import "./scripts/tasks/deploy.ts";
import "./scripts/tasks/gen.ts";
import "./scripts/tasks/mint.ts";
import "./scripts/tasks/loop.ts";
import "./scripts/tasks/transfer.ts";
import "./scripts/tasks/xferEth.ts";

// Acoount config
const OPERATORS: Array<string> = String(process.env.OPERATORS_KEY).split(" ");
const PROXIES: Array<string> = String(process.env.PROXIES_KEY).split(" ");
const USERS: Array<string> = String(process.env.USERS).split(" ");
const accounts: Array<string> = OPERATORS.concat(PROXIES.concat(USERS));

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
      accounts: accounts,
    },
    arbitrum_l2: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: accounts,
	},
    cardona: {
        url: "https://polygon-zkevm-cardona.blockpi.network/v1/rpc/public",
        accounts: accounts,
    },
    custom: {
        url: "http://18.119.5.142:8449",
        accounts: accounts,
    },
  },
  etherscan: {
    apiKey: {
      arbitrum_l2: "FNCTNQB169UAYDPFGW4EHQ7R8JDNITVIDN",
      conduit:  "abcxzy",
      cardona: "DVSJS7JQM8N5JJV91GJAZ9SUNFRHAHIJ2G"
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
      },
      {
        network: "cardona",
        chainId: 2442,
        urls: {
            apiURL: "https://polygon-zkevm-cardona.blockpi.network/v1/rpc/public",
            browserURL: "https://cardona-zkevm.polygonscan.com/",
        },
    },
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
