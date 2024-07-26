const { ethers, upgrades } = require('hardhat');

async function main() {
    const endpointContract = await ethers.getContractFactory('AccessPassEndpoint');
    const operators = [
        '0xc2CCcfd3215A44104D74c5188217574c92d9d745',
    ]
    const proxies = [
        '0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33',
        '0x0000000000000068F116a894984e2DB1123eB395',  // Seaport contract
    ]
    const endpoint = await upgrades.deployProxy(endpointContract, [operators, proxies], {initialize: "initialize", kind: "uups"});
    const endpointAddress = await endpoint.getAddress();
    console.log(`Deploy endpoint contract to: ${endpointAddress}`);
    
    const factoryContract = await ethers.getContractFactory('AccessPassFactory');
    const factory = await upgrades.deployProxy(factoryContract, [endpointAddress], {initialize: "initialize", kind: "uups"});
    const factoryAddress = await factory.getAddress();
    console.log(`Deploy factory contract to: ${factoryAddress}`);
    await endpoint.setFactory(factoryAddress);
    console.log(`Done`);
}

main();
