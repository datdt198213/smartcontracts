import { Contract, Signer, Interface, Wallet, JsonRpcProvider, Provider } from "ethers";
import hre from "hardhat";
import { loadSignersFromLocal, loadWalletsFromLocal } from "../utils/accounts";
import "dotenv/config";

async function bridgeMint(
    contractAddress: string,
    signer: Signer,
    account: string,
    amount: Number
) {
    const iface = new Interface([
        "function bridgeMint(address account, uint256 amount) external",
        "function decimals() public view returns (uint8)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tokenDecimals = await contract.decimals();
    const newAmount = BigInt(amount.toString()) * BigInt(10) ** tokenDecimals;
    const tx = await contract.bridgeMint(account, newAmount);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === "Transfer") {
            const { from, to, value } = mLog.args;
            console.log(
                `Mint successfully! \tsigner: ${await signer.getAddress()}, from: ${from}, to: ${to}, value: ${value}\n`
            );
        }
    }
    return receipt;
}

async function transferFrom(
    contractAddress: string,
    signer: Signer,
    from: string,
    to: string,
    value: Number
) {
    const iface = new Interface([
        "function transferFrom(address from, address to, uint256 value) external returns (bool)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "function decimals() public view returns (uint8)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tokenDecimals = await contract.decimals();
    const newAmount = BigInt(value.toString()) * BigInt(10) ** tokenDecimals;
    // const newAmount = value;
    const tx = await contract.transferFrom(from, to, newAmount);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === "Transfer") {
            const { from, to, value } = mLog.args;
            console.log(
                `Transfer successfully! \tsigner: ${await signer.getAddress()}, from: ${from}, to: ${to}, value: ${value}\n`
            );
        }
    }
    return receipt;
}

async function transfer(
    contractAddress: string,
    signer: Signer,
    to: string,
    value: Number
) {
    const iface = new hre.ethers.Interface([
        "function transfer(address to, uint256 value) external returns (bool)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "function decimals() public view returns (uint8)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tokenDecimals = await contract.decimals();
    const newValue = BigInt(value.toString()) * BigInt(10) ** tokenDecimals;
    const tx = await contract.transfer(to, newValue);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === "Transfer") {
            const { from, to, value } = mLog.args;
            console.log(
                `Transfer successfully! \towner: ${from}, spender: ${to}, value: ${value}\ntx hash: ${tx.hash}`
            );
        }
    }
    return receipt;
}

async function balanceOfERC20(
    contractAddress: string,
    provider: Provider,
    account: string,
) {
    const abi = ["function balanceOf(address account) external view returns (uint256)"]

    const contract = new Contract(contractAddress, abi, provider);
    const balance = await contract.balanceOf(account);
    const balanceETH = await provider.getBalance(account);
    console.log(`Balance of ${account}: ${hre.ethers.formatUnits(balance, 18)} token, ${hre.ethers.formatUnits(balanceETH, 18)} ETH`);
}

async function balanceOf(account: string, provider: Provider) {
    console.log( hre.ethers.formatUnits(await provider.getBalance(account), 18));
}

async function l1Address(
    contractAddress: string,
    signer: Signer
) {
    const iface = new Interface([
        "function l1Address() public view override returns (address)"
    ]);

    const contract = new Contract(contractAddress, iface, signer);

    // const newAmount = value;
    const tx = await contract.l1Address();
    console.log(tx)
}

async function main() {
    const CHILD_TOKEN: string = String(process.env.CHILD_TOKEN);
    const {operators, proxies, users} = await loadSignersFromLocal();
    const {operatorsWallet, proxiesWallet, usersWallet} = await loadWalletsFromLocal();

    const operator = operators[0];
    const admin = proxies[0];
    const user = users[0];
    const user1 = users[users.length - 1];

    const amount: Number = 10000000;
    const provider = hre.ethers.provider;

    // console.log(await user.getAddress());
    // console.log(await user1.getAddress());
    // await transferFrom(CHILD_TOKEN, admin, "0x626cd6496946d868003B087b83071C4ec849b9E6", await user1.getAddress(), 1);
    await balanceOf('0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33', provider);
    // await l1Address(CHILD_TOKEN, operators[1]);
    // await transfer(CHILD_TOKEN, user, await user1.getAddress(), 2000);

    // await balanceOf(CHILD_TOKEN, provider, "0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33")
}

main();
