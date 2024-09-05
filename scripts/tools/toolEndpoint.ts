import { Contract, ethers, Provider, Signer } from "ethers";
import hre from "hardhat";
import "dotenv/config";
import { loadSignersFromLocal, loadWalletsFromLocal } from "../utils/accounts";

async function createCollection(
    contractAddress: string,
    signer: Signer,
    name: string,
    symbol: string,
    dataPath: string,
    admin: string
) {
    const iface = new ethers.Interface([
        "function createCollection(string memory name,string memory symbol,string memory dataPath, address admin) external",
        "event CollectionCreated(string indexed name, string indexed symbol, address indexed contractAddress)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.createCollection(name, symbol, dataPath, admin);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `CollectionCreated`) {
            const { name, symbol, contractAddress } = mLog.args;
            console.log(
                `Create collection successfully! \tContract address: ${contractAddress}, tx hash: ${tx.hash}`
            );
        }
    }
    return receipt;
}

async function mint(
    contractAddress: string,
    signer: Signer,
    name: string,
    to: string,
    tokenIds: Array<Number>
) {
    const iface = new ethers.Interface([
        "function mint(string memory name,address to,uint256[] memory tokenIds) external",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.mint(name, to, tokenIds);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Transfer`) {
            const { from, to, tokenId } = mLog.args;
            console.log(
                `Mint successfully! to: ${to}, tokenId: ${tokenId}, tx hash ${tx.hash}`
            );
        }
    }
    return receipt;
}

async function mintAuto(
    contractAddress: string,
    signer: Signer,
    name: string,
    to: string
) {
    const iface = new ethers.Interface([
        "function mint(string memory name,address to) external",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.mint(name, to);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Transfer`) {
            const { from, to, tokenId } = mLog.args;
            console.log(
                `Mint successfully! to: ${to}, tokenId: ${tokenId}, tx hash ${tx.hash}`
            );
        }
    }
    return receipt;
}

async function lock(
    contractAddress: string,
    signer: Signer,
    name: string,
    tokenId: Number
) {
    const iface = new ethers.Interface([
        "function lock(string memory name,uint256 tokenId) external",
        "event Lock(uint256 indexed id)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.lock(name, tokenId);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Lock`) {
            const { id } = mLog.args;
            console.log(
                `Lock successfully! \tsigner: ${await signer.getAddress()}, id: ${id}`
            );
        }
    }
    return receipt;
}

async function unlock(
    contractAddress: string,
    signer: Signer,
    name: string,
    tokenId: Number
) {
    const iface = new ethers.Interface([
        "function unlock(string memory name,uint256 tokenId) external",
        "event Unlock(uint256 indexed id)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.unlock(name, tokenId);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Unlock`) {
            const { id } = mLog.args;
            console.log(
                `Unlock successfully! \tsigner: ${await signer.getAddress()},id: ${id}`
            );
        }
    }
    return receipt;
}

async function addProxy(
    contractAddress: string,
    signer: Signer,
    proxy: string,
    collections: Array<string>
) {
    const iface = new ethers.Interface([
        "function addProxy(address proxy, address[] memory collections) external", "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)"
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.addProxy(proxy, collections);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if(mLog && mLog.name === `RoleGranted`) {
            const {role, account, sender} = mLog.args;
            console.log(`Grant Role successfully! \nRole ${role}, account: ${account}, sender: ${sender}\nTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}

async function addToSet(
    contractAddress: string,
    signer: Signer,
    proxies: Array<string>
) {
    const iface = new ethers.Interface([
        "function addToSet(address[] memory proxies) external",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.addToSet(proxies);
    const receipt = await tx.wait();
    return receipt;
}

async function removeProxy(
    contractAddress: string,
    signer: Signer,
    proxy: string,
    collections: Array<string>
) {
    const iface = new ethers.Interface([
        "function removeProxy(address proxy, address[] memory collections) external", "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)"
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.removeProxy(proxy, collections);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if(mLog && mLog.name === `RoleRevoked`) {
            const {role, account, sender} = mLog.args;
            console.log(`Revoke Role successfully! \nRole ${role}, account: ${account}, sender: ${sender}\nTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}

async function removeFromSet(
    contractAddress: string,
    signer: Signer,
    proxies: Array<string>
) {
    const iface = new ethers.Interface([
        "function removeFromSet(address[] memory proxies) external",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.removeFromSet(proxies);
    const receipt = await tx.wait();
    return receipt;
}

async function hasRole(
    contractAddress: string,
    signer: Signer,
    role: string,
    account: string
) {
    const iface = new ethers.Interface([
        "function hasRole(bytes32 role, address account) external view returns (bool)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const hasRole = await contract.hasRole(role, account);
    console.log(`${account} has ${role}: ${hasRole}`);
    return hasRole;
}

async function getCollectionAddress(
    contractAddress: string,
    signer: Signer,
    name: string
) {
    const iface = new ethers.Interface([
        "function getCollectionAddress(string memory name) external view returns (address)",
    ]);
    const contract = new Contract(contractAddress, iface, signer);
    const collectionAddress = await contract.getCollectionAddress(name);

    return collectionAddress;
}


async function main() {
    // const endpointAddress: string = String(process.env.ENDPOINT_ADDRESS);
    const endpointAddress: string = '0x40f59138D572E67c8c78dae1277377FC903f25e6'
    const {operators, proxies, users} = await loadSignersFromLocal();
    const {operatorsWallet, proxiesWallet, usersWallet} = await loadWalletsFromLocal();

    const operator = operators[0];
    const admin = proxies[0];
    const user = users[0];
    const user1 = users[1];

    const OPERATOR_ROLE: string = String(process.env.OPERATOR_ROLE);
    const PROXY_ROLE: string = String(process.env.PROXY_ROLE);

    const name1 = "Weapon 1";
    const symbol1 = "W1";
    const dataPath1 = "https://midnight-society.io/metadata/W1/";

    const name2 = "Weapon 2";
    const symbol2 = "W2";
    const dataPath2 = "https://midnight-society.io/metadata/W2/";

    const tokenIds = [1,2,3,4,5,6];

    // await createCollection(endpointAddress, operator, name1, symbol1, dataPath1, await admin.getAddress());
    // await createCollection(endpointAddress, operator, name2, symbol2, dataPath2, await admin.getAddress());

    // await mint(endpointAddress, operator, name1, await user.getAddress(), tokenIds);
    // await mintAuto(endpointAddress, operator, name1, await user.getAddress());

    // await mint(endpointAddress, operator, name2, await user.getAddress(), tokenIds);
    // await mintAuto(endpointAddress, operator, name2, await user.getAddress());

    // await lock(endpointAddress, operator, name1, 34);
    // await unlock(endpointAddress, operator, name1, 34);

    // Check proxy role, add proxy role and revoke proxy role of 2 collections
    // const collection1 = await getCollectionAddress(endpointAddress,operator,name1);
    // const collection2 = await getCollectionAddress(endpointAddress,operator,name2);

    // await hasRole(collection1, operator, PROXY_ROLE, await admin.getAddress());
    // await hasRole(collection2, operator, PROXY_ROLE, await admin.getAddress());

    // await addProxy(endpointAddress, operator, await user.getAddress(), [collection1, collection2]);
    // await addToSet(endpointAddress, operator, [await user1.getAddress()]);

    // await removeProxy(endpointAddress, operator, await user.getAddress(), [collection1, collection2]);
    // await removeFromSet(endpointAddress, operator, [await user1.getAddress()]);
}

main();
