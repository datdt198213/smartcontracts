/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  TestPass,
  TestPassInterface,
} from "../../../../contracts/AccessPass/AccessPass.sol/TestPass";

const _abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "operators",
        type: "address[]",
      },
      {
        internalType: "bool",
        name: "approveProxy",
        type: "bool",
      },
      {
        internalType: "address[]",
        name: "proxies",
        type: "address[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessControlBadConfirmation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "neededRole",
        type: "bytes32",
      },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721InvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC721InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "OPERATOR_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PROXY_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "devMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "freezeBaseOriginalURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "frozen",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getDisplayURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getOriginalURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "callerConfirmation",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "baseURL",
        type: "string",
      },
    ],
    name: "setBaseDisplayURL",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "baseURL",
        type: "string",
      },
    ],
    name: "setBaseOriginalURL",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "approval",
        type: "bool",
      },
    ],
    name: "setProxyApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "switchURL",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040526000805460ff19166001179055600a805460ff60a01b191690553480156200002b57600080fd5b5060405162002822380380620028228339810160408190526200004e91620004c3565b33604080518082018252600a808252694163636573735061737360b01b6020808401829052845180860190955291845290830152906003620000918382620005d7565b506004620000a08282620005d7565b5050506001600160a01b038116620000d357604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b620000de81620002db565b50600a805460ff60a81b1916600160a81b84151502179055620001036000336200032d565b5060005b8351811015620001f55760006001600160a01b0316848281518110620001315762000131620006a3565b60200260200101516001600160a01b0316036200019d5760405162461bcd60e51b8152602060048201526024808201527f43616e2774206164642061206e756c6c2061646472657373206173206f70657260448201526330ba37b960e11b6064820152608401620000ca565b620001eb7f97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929858381518110620001d757620001d7620006a3565b60200260200101516200032d60201b60201c565b5060010162000107565b5060005b8151811015620002d15760006001600160a01b0316828281518110620002235762000223620006a3565b60200260200101516001600160a01b0316036200028d5760405162461bcd60e51b815260206004820152602160248201527f43616e2774206164642061206e756c6c20616464726573732061732070726f786044820152607960f81b6064820152608401620000ca565b620002c77f77d72916e966418e6dc58a19999ae9934bef3f749f1547cde0a86e809f19c89b838381518110620001d757620001d7620006a3565b50600101620001f9565b50505050620006b9565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b60008281526009602090815260408083206001600160a01b038516845290915281205460ff16620003d65760008381526009602090815260408083206001600160a01b03861684529091529020805460ff191660011790556200038d3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a4506001620003da565b5060005b92915050565b634e487b7160e01b600052604160045260246000fd5b80516001600160a01b03811681146200040e57600080fd5b919050565b600082601f8301126200042557600080fd5b815160206001600160401b0380831115620004445762000444620003e0565b8260051b604051601f19603f830116810181811084821117156200046c576200046c620003e0565b60405293845260208187018101949081019250878511156200048d57600080fd5b6020870191505b84821015620004b857620004a882620003f6565b8352918301919083019062000494565b979650505050505050565b600080600060608486031215620004d957600080fd5b83516001600160401b0380821115620004f157600080fd5b620004ff8783880162000413565b94506020860151915081151582146200051757600080fd5b6040860151919350808211156200052d57600080fd5b506200053c8682870162000413565b9150509250925092565b600181811c908216806200055b57607f821691505b6020821081036200057c57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620005d2576000816000526020600020601f850160051c81016020861015620005ad5750805b601f850160051c820191505b81811015620005ce57828155600101620005b9565b5050505b505050565b81516001600160401b03811115620005f357620005f3620003e0565b6200060b8162000604845462000546565b8462000582565b602080601f8311600181146200064357600084156200062a5750858301515b600019600386901b1c1916600185901b178555620005ce565b600085815260208120601f198616915b82811015620006745788860151825594840194600190910190840162000653565b5085821015620006935787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052603260045260246000fd5b61215980620006c96000396000f3fe608060405234801561001057600080fd5b50600436106102265760003560e01c8063715018a61161012a578063c87b56dd116100bd578063dde8cb4c1161008c578063e985e9c511610071578063e985e9c5146104c9578063f2fde38b146104dc578063f5b541a6146104ef57600080fd5b8063dde8cb4c1461048f578063e48bf15b146104a257600080fd5b8063c87b56dd14610443578063cbd0a1fa14610456578063d547741f14610469578063dc7346d91461047c57600080fd5b80639de98db8116100f95780639de98db814610402578063a217fddf14610415578063a22cb4651461041d578063b88d4fde1461043057600080fd5b8063715018a6146103a85780638da5cb5b146103b057806391d14854146103c157806395d89b41146103fa57600080fd5b8063248a9ca3116101bd57806342966c681161018c5780635e9f7613116101715780635e9f76131461036f5780636352211e1461038257806370a082311461039557600080fd5b806342966c68146103545780634acf9ac21461036757600080fd5b8063248a9ca3146102ea5780632f2ff15d1461031b57806336568abe1461032e57806342842e0e1461034157600080fd5b8063081812fc116101f9578063081812fc1461028f578063095ea7b3146102ba5780630c6196fb146102cf57806323b872dd146102d757600080fd5b806301ffc9a71461022b5780630207dab314610253578063054f7d9c1461027357806306fdde0314610287575b600080fd5b61023e610239366004611b45565b610516565b60405190151581526020015b60405180910390f35b610266610261366004611b62565b610527565b60405161024a9190611bcb565b600a5461023e90600160a01b900460ff1681565b6102666105bd565b6102a261029d366004611b62565b61064f565b6040516001600160a01b03909116815260200161024a565b6102cd6102c8366004611bfa565b610678565b005b6102cd610687565b6102cd6102e5366004611c24565b6106bf565b61030d6102f8366004611b62565b60009081526009602052604090206001015490565b60405190815260200161024a565b6102cd610329366004611c60565b610768565b6102cd61033c366004611c60565b61078d565b6102cd61034f366004611c24565b6107de565b6102cd610362366004611b62565b6107f9565b6102cd610874565b61026661037d366004611b62565b610939565b6102a2610390366004611b62565b61094b565b61030d6103a3366004611c8c565b610956565b6102cd6109b7565b600a546001600160a01b03166102a2565b61023e6103cf366004611c60565b60009182526009602090815260408084206001600160a01b0393909316845291905290205460ff1690565b6102666109c9565b6102cd610410366004611cb7565b6109d8565b61030d600081565b6102cd61042b366004611cd2565b610a19565b6102cd61043e366004611d9b565b610a24565b610266610451366004611b62565b610a3c565b6102cd610464366004611e17565b610aa1565b6102cd610477366004611c60565b610bb0565b6102cd61048a366004611e60565b610bd5565b6102cd61049d366004611e17565b610d85565b61030d7f77d72916e966418e6dc58a19999ae9934bef3f749f1547cde0a86e809f19c89b81565b61023e6104d7366004611f19565b610e3a565b6102cd6104ea366004611c8c565b610ecb565b61030d7f97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b92981565b600061052182610f1f565b92915050565b60606105216001805461053990611f43565b80601f016020809104026020016040519081016040528092919081815260200182805461056590611f43565b80156105b25780601f10610587576101008083540402835291602001916105b2565b820191906000526020600020905b81548152906001019060200180831161059557829003601f168201915b505050505083610f5d565b6060600380546105cc90611f43565b80601f01602080910402602001604051908101604052809291908181526020018280546105f890611f43565b80156106455780601f1061061a57610100808354040283529160200191610645565b820191906000526020600020905b81548152906001019060200180831161062857829003601f168201915b5050505050905090565b600061065a82610fb5565b506000828152600760205260409020546001600160a01b0316610521565b610683828233610fee565b5050565b61068f610ffb565b600a80547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff16600160a01b179055565b6001600160a01b0382166106ee57604051633250574960e11b8152600060048201526024015b60405180910390fd5b60006106fb838333611041565b9050836001600160a01b0316816001600160a01b031614610762576040517f64283d7b0000000000000000000000000000000000000000000000000000000081526001600160a01b03808616600483015260248201849052821660448201526064016106e5565b50505050565b60008281526009602052604090206001015461078381611147565b6107628383611151565b6001600160a01b03811633146107cf576040517f6697b23200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6107d982826111ff565b505050565b6107d983838360405180602001604052806000815250610a24565b60008181526005602052604090205461081c906001600160a01b03163383611286565b6108685760405162461bcd60e51b815260206004820181905260248201527f43616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656460448201526064016106e5565b610871816112ec565b50565b3360009081527f84e70a45dc3cad9f831e8a7d9f4327701c9df1c790bfeaa7b6cb95e200be6733602052604090205460ff16806108bb5750600a546001600160a01b031633145b6109205760405162461bcd60e51b815260206004820152603060248201527f46756e6374696f6e2063616e206f6e6c792062652063616c6c6564206279206f60448201526f3bb732b91037b91037b832b930ba37b960811b60648201526084016106e5565b6109376000805460ff19811660ff90911615179055565b565b60606105216002805461053990611f43565b600061052182610fb5565b60006001600160a01b03821661099b576040517f89c62b64000000000000000000000000000000000000000000000000000000008152600060048201526024016106e5565b506001600160a01b031660009081526006602052604090205490565b6109bf610ffb565b6109376000611327565b6060600480546105cc90611f43565b6109e0610ffb565b600a8054911515600160a81b027fffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffff909216919091179055565b610683338383611386565b610a2f8484846106bf565b610762338585858561143e565b606060008211610a8e5760405162461bcd60e51b815260206004820152601460248201527f546f6b656e2049442063616e6e6f74206265203000000000000000000000000060448201526064016106e5565b610a9782610fb5565b5061052182611569565b3360009081527f84e70a45dc3cad9f831e8a7d9f4327701c9df1c790bfeaa7b6cb95e200be6733602052604090205460ff1680610ae85750600a546001600160a01b031633145b610b4d5760405162461bcd60e51b815260206004820152603060248201527f46756e6374696f6e2063616e206f6e6c792062652063616c6c6564206279206f60448201526f3bb732b91037b91037b832b930ba37b960811b60648201526084016106e5565b600a54600160a01b900460ff1615610ba75760405162461bcd60e51b815260206004820152601260248201527f436f6e74726163742069732066726f7a656e000000000000000000000000000060448201526064016106e5565b61087181611597565b600082815260096020526040902060010154610bcb81611147565b61076283836111ff565b3360009081527f84e70a45dc3cad9f831e8a7d9f4327701c9df1c790bfeaa7b6cb95e200be6733602052604090205460ff1680610c1c5750600a546001600160a01b031633145b610c815760405162461bcd60e51b815260206004820152603060248201527f46756e6374696f6e2063616e206f6e6c792062652063616c6c6564206279206f60448201526f3bb732b91037b91037b832b930ba37b960811b60648201526084016106e5565b6000815111610cd25760405162461bcd60e51b815260206004820152601360248201527f496e76616c696420696e7075742061727261790000000000000000000000000060448201526064016106e5565b60005b81518110156107d9576000828281518110610cf257610cf2611f7d565b6020026020010151905060008111610d725760405162461bcd60e51b815260206004820152602260248201527f546f6b656e204944206d7573742062652067726561746572207468616e207a6560448201527f726f00000000000000000000000000000000000000000000000000000000000060648201526084016106e5565b610d7c84826115f1565b50600101610cd5565b3360009081527f84e70a45dc3cad9f831e8a7d9f4327701c9df1c790bfeaa7b6cb95e200be6733602052604090205460ff1680610dcc5750600a546001600160a01b031633145b610e315760405162461bcd60e51b815260206004820152603060248201527f46756e6374696f6e2063616e206f6e6c792062652063616c6c6564206279206f60448201526f3bb732b91037b91037b832b930ba37b960811b60648201526084016106e5565b6108718161160b565b600a54600090600160a81b900460ff168015610e8d57506001600160a01b03821660009081527f38dfc93000b3bf136619fcec92086b275098bed49d89b371c0550901ca55c0bd602052604090205460ff165b15610e9a57506001610521565b6001600160a01b0380841660009081526008602090815260408083209386168352929052205460ff165b9392505050565b610ed3610ffb565b6001600160a01b038116610f16576040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600060048201526024016106e5565b61087181611327565b60006001600160e01b031982167f7965db0b000000000000000000000000000000000000000000000000000000001480610521575061052182611665565b6060610f698351151590565b15610f9f5782610f7883611700565b604051602001610f89929190611f93565b6040516020818303038152906040529050610521565b5060408051602081019091526000815292915050565b6000818152600560205260408120546001600160a01b03168061052157604051637e27328960e01b8152600481018490526024016106e5565b6107d983838360016117a0565b600a546001600160a01b03163314610937576040517f118cdaa70000000000000000000000000000000000000000000000000000000081523360048201526024016106e5565b6000828152600560205260408120546001600160a01b039081169083161561106e5761106e8184866118cc565b6001600160a01b038116156110ac5761108b6000856000806117a0565b6001600160a01b038116600090815260066020526040902080546000190190555b6001600160a01b038516156110db576001600160a01b0385166000908152600660205260409020805460010190555b600084815260056020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b6108718133611949565b60008281526009602090815260408083206001600160a01b038516845290915281205460ff166111f75760008381526009602090815260408083206001600160a01b03861684529091529020805460ff191660011790556111af3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a4506001610521565b506000610521565b60008281526009602090815260408083206001600160a01b038516845290915281205460ff16156111f75760008381526009602090815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a4506001610521565b60006001600160a01b038316158015906112e45750826001600160a01b0316846001600160a01b031614806112c057506112c08484610e3a565b806112e457506000828152600760205260409020546001600160a01b038481169116145b949350505050565b60006112fb6000836000611041565b90506001600160a01b03811661068357604051637e27328960e01b8152600481018390526024016106e5565b600a80546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0382166113d1576040517f5b08ba180000000000000000000000000000000000000000000000000000000081526001600160a01b03831660048201526024016106e5565b6001600160a01b03838116600081815260086020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b6001600160a01b0383163b1561156257604051630a85bd0160e11b81526001600160a01b0384169063150b7a0290611480908890889087908790600401611fc2565b6020604051808303816000875af19250505080156114bb575060408051601f3d908101601f191682019092526114b891810190611ffe565b60015b611524573d8080156114e9576040519150601f19603f3d011682016040523d82523d6000602084013e6114ee565b606091505b50805160000361151c57604051633250574960e11b81526001600160a01b03851660048201526024016106e5565b805181602001fd5b6001600160e01b03198116630a85bd0160e11b1461156057604051633250574960e11b81526001600160a01b03851660048201526024016106e5565b505b5050505050565b60005460609060ff1615611587576105216002805461053990611f43565b6105216001805461053990611f43565b80516115e55760405162461bcd60e51b815260206004820152601060248201527f4e65656420612076616c69642055524c0000000000000000000000000000000060448201526064016106e5565b60016106838282612063565b6106838282604051806020016040528060008152506119b7565b80516116595760405162461bcd60e51b815260206004820152601060248201527f4e65656420612076616c69642055524c0000000000000000000000000000000060448201526064016106e5565b60026106838282612063565b60006001600160e01b031982167f80ac58cd0000000000000000000000000000000000000000000000000000000014806116c857506001600160e01b031982167f5b5e139f00000000000000000000000000000000000000000000000000000000145b8061052157507f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b0319831614610521565b6060600061170d836119cf565b600101905060008167ffffffffffffffff81111561172d5761172d611cfc565b6040519080825280601f01601f191660200182016040528015611757576020820181803683370190505b5090508181016020015b600019017f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a850494508461176157509392505050565b80806117b457506001600160a01b03821615155b1561188f5760006117c484610fb5565b90506001600160a01b038316158015906117f05750826001600160a01b0316816001600160a01b031614155b801561180357506118018184610e3a565b155b15611845576040517fa9fbf51f0000000000000000000000000000000000000000000000000000000081526001600160a01b03841660048201526024016106e5565b811561188d5783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b50506000908152600760205260409020805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055565b6118d7838383611286565b6107d9576001600160a01b03831661190557604051637e27328960e01b8152600481018290526024016106e5565b6040517f177e802f0000000000000000000000000000000000000000000000000000000081526001600160a01b0383166004820152602481018290526044016106e5565b60008281526009602090815260408083206001600160a01b038516845290915290205460ff16610683576040517fe2517d3f0000000000000000000000000000000000000000000000000000000081526001600160a01b0382166004820152602481018390526044016106e5565b6119c18383611ab1565b6107d933600085858561143e565b6000807a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008310611a18577a184f03e93ff9f4daa797ed6e38ed64bf6a1f010000000000000000830492506040015b6d04ee2d6d415b85acef81000000008310611a44576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc100008310611a6257662386f26fc10000830492506010015b6305f5e1008310611a7a576305f5e100830492506008015b6127108310611a8e57612710830492506004015b60648310611aa0576064830492506002015b600a83106105215760010192915050565b6001600160a01b038216611adb57604051633250574960e11b8152600060048201526024016106e5565b6000611ae983836000611041565b90506001600160a01b038116156107d9576040517f73c6ac6e000000000000000000000000000000000000000000000000000000008152600060048201526024016106e5565b6001600160e01b03198116811461087157600080fd5b600060208284031215611b5757600080fd5b8135610ec481611b2f565b600060208284031215611b7457600080fd5b5035919050565b60005b83811015611b96578181015183820152602001611b7e565b50506000910152565b60008151808452611bb7816020860160208601611b7b565b601f01601f19169290920160200192915050565b602081526000610ec46020830184611b9f565b80356001600160a01b0381168114611bf557600080fd5b919050565b60008060408385031215611c0d57600080fd5b611c1683611bde565b946020939093013593505050565b600080600060608486031215611c3957600080fd5b611c4284611bde565b9250611c5060208501611bde565b9150604084013590509250925092565b60008060408385031215611c7357600080fd5b82359150611c8360208401611bde565b90509250929050565b600060208284031215611c9e57600080fd5b610ec482611bde565b80358015158114611bf557600080fd5b600060208284031215611cc957600080fd5b610ec482611ca7565b60008060408385031215611ce557600080fd5b611cee83611bde565b9150611c8360208401611ca7565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715611d3b57611d3b611cfc565b604052919050565b600067ffffffffffffffff831115611d5d57611d5d611cfc565b611d70601f8401601f1916602001611d12565b9050828152838383011115611d8457600080fd5b828260208301376000602084830101529392505050565b60008060008060808587031215611db157600080fd5b611dba85611bde565b9350611dc860208601611bde565b925060408501359150606085013567ffffffffffffffff811115611deb57600080fd5b8501601f81018713611dfc57600080fd5b611e0b87823560208401611d43565b91505092959194509250565b600060208284031215611e2957600080fd5b813567ffffffffffffffff811115611e4057600080fd5b8201601f81018413611e5157600080fd5b6112e484823560208401611d43565b60008060408385031215611e7357600080fd5b611e7c83611bde565b915060208084013567ffffffffffffffff80821115611e9a57600080fd5b818601915086601f830112611eae57600080fd5b813581811115611ec057611ec0611cfc565b8060051b9150611ed1848301611d12565b8181529183018401918481019089841115611eeb57600080fd5b938501935b83851015611f0957843582529385019390850190611ef0565b8096505050505050509250929050565b60008060408385031215611f2c57600080fd5b611f3583611bde565b9150611c8360208401611bde565b600181811c90821680611f5757607f821691505b602082108103611f7757634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052603260045260246000fd5b60008351611fa5818460208801611b7b565b835190830190611fb9818360208801611b7b565b01949350505050565b60006001600160a01b03808716835280861660208401525083604083015260806060830152611ff46080830184611b9f565b9695505050505050565b60006020828403121561201057600080fd5b8151610ec481611b2f565b601f8211156107d9576000816000526020600020601f850160051c810160208610156120445750805b601f850160051c820191505b8181101561156057828155600101612050565b815167ffffffffffffffff81111561207d5761207d611cfc565b6120918161208b8454611f43565b8461201b565b602080601f8311600181146120c657600084156120ae5750858301515b600019600386901b1c1916600185901b178555611560565b600085815260208120601f198616915b828110156120f5578886015182559484019460019091019084016120d6565b50858210156121135787850151600019600388901b60f8161c191681555b5050505050600190811b0190555056fea26469706673582212203e8c6cdfb54824599e901539f88e15042c6d06cf69559e8199751b7b31170b9664736f6c63430008180033";

type TestPassConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestPassConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestPass__factory extends ContractFactory {
  constructor(...args: TestPassConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    operators: AddressLike[],
    approveProxy: boolean,
    proxies: AddressLike[],
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      operators,
      approveProxy,
      proxies,
      overrides || {}
    );
  }
  override deploy(
    operators: AddressLike[],
    approveProxy: boolean,
    proxies: AddressLike[],
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      operators,
      approveProxy,
      proxies,
      overrides || {}
    ) as Promise<
      TestPass & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): TestPass__factory {
    return super.connect(runner) as TestPass__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestPassInterface {
    return new Interface(_abi) as TestPassInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): TestPass {
    return new Contract(address, _abi, runner) as unknown as TestPass;
  }
}
