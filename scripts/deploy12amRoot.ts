const { ethers, upgrades } = require('hardhat');

async function main() {
    const tokenContract = await ethers.getContractFactory('MidnightSociety');
    const operators = [
        '0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33',
        '0xc2CCcfd3215A44104D74c5188217574c92d9d745',
    ]
    const beaconOwner = operators[1];

    const gateway = '0xF99a637842E0282002399fD9f2024d485B170850';
    const router = '0x02C5F9592E8873e160c98C01689F33D1F4347592';
    const token = await upgrades.deployProxy(tokenContract, [operators, gateway, router], {initialize: "initialize", kind: "uups"});
    const tokenAddress = await token.getAddress();
    console.log(`Deploy token to: ${tokenAddress}`);
    
    const factory = await ethers.getContractFactory('VestingWalletFactory');
    const vault = await upgrades.deployProxy(factory, [tokenAddress, beaconOwner], {initialize: "initialize", kind: "uups"});
    const vaultAddress = await vault.getAddress();
    console.log(`Deploy vaultFactory to: ${vaultAddress}`);
    await token.setVaultFactory(vaultAddress);
    console.log(`Done`);
}

main();
