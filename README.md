# MidnightSociety Token Contracts

### 12am: erc20 tokens
    + MidnightSociety.sol: 12AM token contract which will be deployed to L2 chain (Arbitrum One mainnet).
    + ChildToken.sol: 12AM token contract which will be deployed to local L3 chain (Arbitrum Orbit).
    + utils/VestingWalletCliffUpgradeable.sol: vesting wallet contract.
    + utils/VestingWalletFactory.sol: a factory contract, used to create all vesting wallet instances.
### AccessPass: nft
    + AccessPass.sol: NFT contract
    + AccessPassFactory.sol: a factory contract, used to create all AccessPass instances.
    + AccessPassEndpoint.sol: an endpoint contract for creating nft collections, minting nfts and managing proxies (of all created collections).

### Run test command
```
yarn test
```

https://api.etherscan.io/api?module=contract&action=getabi&address=0xAbbdf23b192eD3d229608289368000cF5F99c752&apikey=WDEIINZHN7I2XNZ19NHK7ME1J54JHRQBBJ