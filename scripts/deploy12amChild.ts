const { ethers, upgrades } = require('hardhat');

async function main() {
    const token = await ethers.getContractFactory('ChildToken');
    const proxies = [
        '0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33',
        '0xc2CCcfd3215A44104D74c5188217574c92d9d745',
    ]
    const gateway = '0x033CA6937a6eF7145A75bFc23C1640F0c7b8a98B';
    const rootToken = '0x2405206022B2bB089E6D11CC7bcA1551307F95Af';
    const deployed = await upgrades.deployProxy(token, [gateway, rootToken, proxies], {initialize: "initialize", kind: "uups"});
    console.log(`Deploy to: ${await deployed.getAddress()}`);
}

main();
