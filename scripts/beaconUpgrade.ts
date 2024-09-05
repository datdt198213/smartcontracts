import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function upgradeBeacon(
    oldContractVersion: string,
    newContractVersion: string,
    factory: string
) {
    const factoryContract = await hre.ethers.getContractFactory(
        "VestingWalletFactory"
    );

    const signers = await hre.ethers.getSigners();
    const operator = signers[1];
    const contract = factoryContract.attach(factory);
    const beaconAddress = await contract.connect(operator).beacon();
    const oldContract = await hre.ethers.getContractFactory(oldContractVersion);
    const newContract = await hre.ethers.getContractFactory(newContractVersion);
    const vestingImport = await hre.upgrades.forceImport(
        beaconAddress,
        oldContract
    );

    const vestingUpgrade = await hre.upgrades.upgradeBeacon(
        beaconAddress,
        newContract.connect(operator)
    );
    console.log("Deploy to: ", await vestingUpgrade.getAddress());
}

const factory = process.env.VAULT_FACTORY;
const oldContractVersion = "VestingWalletCliffUpgradeableV2";
const newContractVersion = "VestingWalletCliffUpgradeable";
upgradeBeacon(oldContractVersion, newContractVersion, factory!);
