import { Contract, ethers, Signer } from "ethers";
import hre from "hardhat";
import { loadSignersFromLocal, loadWalletsFromLocal } from "../utils/accounts";
import "dotenv/config";

// AccesssPass
async function setBaseOriginalURL(
    contractAddress: string,
    signer: Signer,
    baseURL: string
) {
    const iface = new ethers.Interface(
        ["function setBaseOriginalURL(string memory baseURL) external"]
    );

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.setBaseOriginalURL(baseURL);
    const receipt = await tx.wait();
    return receipt;
}

async function setBaseDisplayURL(
    contractAddress: string,
    signer: Signer,
    baseURL: string
) {
    const iface = new ethers.Interface(
        ["function setBaseDisplayURL(string memory baseURL) external"]
    );

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.setBaseDisplayURL(baseURL);
    const receipt = await tx.wait();
    return receipt;
}

async function mint(
    contractAddress: string,
    signer: Signer,
    to: string,
    tokenIds: Array<Number>
) {
    const iface = new ethers.Interface([
        "function mint(address to, uint256[] memory tokenIds) external",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.mint(to, tokenIds);
    const receipt = await tx.wait();
    return receipt;
}

async function burn(contractAddress: string, signer: Signer, tokenId: Number) {
    const iface = new ethers.Interface([
        "function burn(uint256 tokenId) external",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.burn(tokenId);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Transfer`) {
            console.log(
                `Burn successfully! \tTokenId ${tokenId}, tx hash: ${tx.hash}`
            );
        }
    }
    return receipt;
}

async function lock(contractAddress: string, signer: Signer, id: Number) {
    const iface = new ethers.Interface(["function lock(uint256 id) external", "event Lock(uint256 indexed id)"]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.lock(id);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Lock`) {
            const {id} = mLog.args;
            console.log(`Lock token successfully!\nTokenId: ${id}\tTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}

async function unlock(contractAddress: string, signer: Signer, id: Number) {
    const iface = new ethers.Interface([
        "function unlock(uint256 id) external", "event Unlock(uint256 indexed id)"
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tx = await contract.unlock(id);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Unlock`) {
            const {id} = mLog.args;
            console.log(`Unlock token successfully!\nTokenId: ${id}\tTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}

async function transferFrom(
    contractAddress: string,
    signer: Signer,
    from: string,
    to: string,
    tokenId: Number
) {
    const iface = new ethers.Interface([
        "function transferFrom(address from, address to, uint256 tokenId) external", "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ]);

    const accessPass = new ethers.Contract(contractAddress, iface, signer);
    const tx = await accessPass.transferFrom(from, to, tokenId);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Transfer`) {
            const {from, to, tokenId} = mLog.args;
            console.log(`Transfer token successfully!\nFrom: ${from}, to: ${to}, tokenId: ${tokenId}\nTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}

async function approve(
    contractAddress: string,
    signer: Signer,
    to: string,
    tokenId: Number
) {
    const iface = new ethers.Interface([
        "function approve(address to, uint256 tokenId) external", "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)"
    ]);

    const accessPass = new ethers.Contract(contractAddress, iface, signer);
    const tx = await accessPass.approve(to, tokenId);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `Approval`) {
            const {owner, approved, tokenId} = mLog.args;
            console.log(`Approve suceessfully!\nOwner: ${owner}, Approved: ${approved}, TokenId: ${tokenId}\nTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}

async function grantRole(
    contractAddress: string,
    signer: Signer,
    role: string,
    account: string
) {
    const iface = new ethers.Interface([
        "function grantRole(bytes32 role, address account) external", "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)"
    ]);

    const accessPass = new ethers.Contract(contractAddress, iface, signer);
    const tx = await accessPass.grantRole(role, account);
    console.log(tx.hash)
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if(mLog && mLog.name === `RoleGranted`) {
            const {role, account, sender} = mLog.args;
            console.log(`Grant Role successfully! \nRole ${role}, account: ${account}, sender: ${sender}\tTx hash: ${tx.hash}`);
        }
    }
    return receipt;
}


async function main() {
    const accessPassAddress: string = String(process.env.WEAPON1);
    const {operators, proxies, users} = await loadSignersFromLocal();
    const {operatorsWallet, proxiesWallet, usersWallet} = await loadWalletsFromLocal();

    const operator = operators[0];
    const admin = proxies[0];
    const proxy = proxies[0];
    const user = users[0];
    const user1 = users[1];

    const OPERATOR_ROLE: string = String(process.env.OPERATOR_ROLE);
    const PROXY_ROLE: string = String(process.env.PROXY_ROLE);

    const tokenId = 4;
    // await burn(accessPassAddress, proxy, tokenId);
    
    // await setBaseDisplayURL(accessPassAddress, operator, 'https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS')

    // Transfer token from user to user1 using proxy wallet
    // await transferFrom(accessPassAddress, proxy, await user1.getAddress(), await user.getAddress(), tokenId);
    
    // Approve for operator can transfer token of user1
    // await approve(accessPassAddress, user1, await operator.getAddress(), tokenId);
    // await transferFrom(accessPassAddress, operator, await user1.getAddress(), await operator.getAddress(), tokenId);
    
    // Grant operator role for operator wallet
    // await grantRole(accessPassAddress, admin, OPERATOR_ROLE, await operator.getAddress());

    // Lock and unlock token using operator wallet
    // await lock(accessPassAddress, operator, tokenId)
    // await unlock(accessPassAddress, operator, tokenId)

    // await transferFrom(accessPassAddress, operator, await operator.getAddress(), await user1.getAddress(), tokenId)
}

main();
