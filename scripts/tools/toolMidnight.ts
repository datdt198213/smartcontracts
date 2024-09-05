import hre from "hardhat";
import { Contract, ethers, Interface, Signer } from "ethers";
import "dotenv/config";
import { loadSignersFromLocal, loadWalletsFromLocal } from "../utils/accounts";

async function mint(
    contractAddress: string,
    signer: Signer,
    wallet: string,
    amount: Number
) {
    const iface = new ethers.Interface([
        "function mint(address wallet, uint256 amount) public",
        "function decimals() public view returns (uint8)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tokenDecimals = await contract.decimals();
    const newAmount = BigInt(amount.toString()) * BigInt(10) ** tokenDecimals;
    const tx = await contract.mint(wallet, newAmount);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === "Transfer") {
            const { from, to, value } = mLog.args;
            console.log(
                `Mint successfully! \tfrom: ${from}, to: ${to}, value: ${value}\ntx hash: ${tx.hash}`
            );
        }
    }
    return receipt;
}

async function approve(
    contractAddress: string,
    signer: Signer,
    spender: string,
    value: Number
) {
    const iface = new ethers.Interface([
        "function approve(address spender, uint256 value) external returns (bool)",
        "function decimals() public view returns (uint8)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
    ]);

    const contract = new Contract(contractAddress, iface, signer);
    const tokenDecimals = await contract.decimals();
    const newValue = BigInt(value.toString()) * BigInt(10) ** tokenDecimals;
    const tx = await contract.approve(spender, newValue);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === "Approval") {
            const { owner, spender, value } = mLog.args;
            console.log(
                `Approve successfully! \towner: ${owner}, spender: ${spender}, value: ${value}\ntx hash: ${tx.hash}`
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
    const iface = new ethers.Interface([
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

async function mintLockup(
    contractAddress: string,
    signer: Signer,
    beneficiary: string,
    start: BigInt,
    cliff: BigInt,
    duration: BigInt,
    operator: string,
    revocable: boolean,
    amount: BigInt
) {
    const iface = new ethers.Interface([
        "function mintLockup(address beneficiary,uint64 start,uint64 cliff,uint64 duration,address operator,bool revocable,uint256 amount) public",
        "event MintLockUp(address indexed vaultAddress, address indexed beneficiary, uint64 start, uint64 cliff, uint64 duration, address operator, bool revocable, uint256 amount)",
    ]);

    const contract = new ethers.Contract(contractAddress, iface, signer);
    const tx = await contract.mintLockup(
        beneficiary,
        start,
        cliff,
        duration,
        operator,
        revocable,
        amount
    );
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === `MintLockUp`) {
            const {
                vaultAddress,
                beneficiary,
                start,
                cliff,
                duration,
                operator,
                revocable,
                amount,
            } = mLog.args;
            console.log(
                `MintLockup successfully! \tVault address: ${vaultAddress}, tx hash: ${tx.hash}`
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
    const tx = await contract.transferFrom(from, to, newAmount);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
        const mLog = iface.parseLog(log);
        if (mLog && mLog.name === "Transfer") {
            const { from, to, value } = mLog.args;
            console.log(
                `Transfer successfully! \tsigner: ${await signer.getAddress()}, from: ${from}, to: ${to}, value: ${value}\nTx hash: ${tx.hash}`
            );
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


async function setChainInfo(
    contractAddress: string,
    signer: Signer,
    gateway: string,
    router: string
) {
    const iface = new ethers.Interface([
        "function setChainInfo(address _gateway, address _router) external"
    ]);

    const midnight = new ethers.Contract(contractAddress, iface, signer);
    const tx = await midnight.setChainInfo(gateway, router);
    console.log(`Tx hash: ${tx.hash}`)
}

async function depositERC20(
    contractAddress: string,
    signer: Signer,
    amount: Number
) {
    const iface = new ethers.Interface([
        "function depositERC20(uint256 amount) public returns (uint256)"
    ]);

    const midnight = new ethers.Contract(contractAddress, iface, signer);
    const tx = await midnight.depositERC20(amount);
    console.log(`Tx hash: ${tx.hash}`)
}



async function main() {
    // const TOKEN_ADDRESS = String(process.env.TOKEN_ADDRESS);
    const amount = 20n;
    const start = BigInt(parseInt((new Date().getTime() / 1000).toString()));
    const cliff = 400n;
    const duration = 4000n;
    const revocable = true;
    const {operators, proxies, users} = await loadSignersFromLocal();
    const {operatorsWallet, proxiesWallet, usersWallet} = await loadWalletsFromLocal();
    const operator = operators[0];
    const operator2 = operators[1];
    const proxy = proxies[0];
    const user = users[0];
    const user1 = users[1];

    const OPERATOR_ROLE: string = String(process.env.OPERATOR_ROLE);
    const PROXY_ROLE: string = String(process.env.PROXY_ROLE);
    const gateway: string = String(process.env.ROOT_GATEWAY)
    const router: string = String(process.env.ROOT_ROUTER)
    // const gateway: string = "0x336038b699730778Ddd801aB6319e8500C9B88eF"
    // const router: string = "0x08436839AD9bd38c56efA214d78201D303100989"
    const TOKEN_ADDRESS: string = "0x4684fd99c727Bc04af785f1D195CFC6d4ad2484c"
    // const TOKEN_ADDRESS: string = String(process.env.TOKEN_ADDRESS)

    // console.log(await operators[1].getAddress())
    // Test for deposit
    await mint(
        TOKEN_ADDRESS,
        operator,
        await operator2.getAddress(),
        Number(amount)
    );


    // console.log(await user.getAddress())

    // await transferFrom(TOKEN_ADDRESS, proxy, await user.getAddress(), await user1.getAddress() , 1000);

    // await grantRole(TOKEN_ADDRESS, operator, PROXY_ROLE, await proxy.getAddress());


    // await mintLockup(TOKEN_ADDRESS, operator, await proxy.getAddress(), start, cliff, duration, await operator.getAddress(), revocable, amount);
    // Test for api code
    // await mint(TOKEN_ADDRESS, operator, "0xE78262c4b9db99B23CA7C981798c4a3999Ac72DF", Number(10));
    // await setChainInfo(TOKEN_ADDRESS, operator, gateway, router);
    // await approve(TOKEN_ADDRESS, operator, "0xb536f11c9030345F85e16E1A929DA62694f70978", Number(amount));
}

main();
