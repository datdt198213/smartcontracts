const { ethers, upgrades } = require('hardhat');

async function main() {
    const token = await ethers.getContractFactory('ChildToken');
    const proxies = [
        '0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33',
        '0xc2CCcfd3215A44104D74c5188217574c92d9d745',
    ]
    const gateway = '0x0778Ff3f63bd242938Ea111f047aD1D1bDdBAD4F';
    const rootToken = '0x94c3EA735DaAd43c5A9E48De2E42284951Bfb1a1';
    const deployed = await upgrades.deployProxy(token, [gateway, rootToken, proxies], {initialize: "initialize", kind: "uups"});
    console.log(`Deploy to: ${await deployed.getAddress()}`);
}

main();
