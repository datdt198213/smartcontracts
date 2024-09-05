import { ethers } from "ethers";

const url = "http://3.139.144.111:8547";
const provider = new ethers.JsonRpcProvider(url);
const privKey = "5f00a94a5ea03fe9272e6f04b5c517297bde4d4ead2d7b1af443971dff2049f1";
const signer = new ethers.Wallet(privKey, provider);

const inboxAddr = "0xb536f11c9030345F85e16E1A929DA62694f70978";

const depositEthInterface = new ethers.Interface([
    "function depositEth() public payable",
]);
const contract = new ethers.Contract(inboxAddr, depositEthInterface, signer);

const nativeToken = "0x19521EF758A5C25a80C9D1e284DE0d25CcCf71B8";

const erc20InboxInterface = new ethers.Interface([
  'function depositERC20(uint256) public returns (uint256)',
])

const erc20TokenInterface = new ethers.Interface([
  'function approve(address, uint256) public',
])

const erc20Inbox = new ethers.Contract(
    inboxAddr,
    erc20InboxInterface,
    signer
)

const erc20Token = new ethers.Contract(
    nativeToken,
    erc20TokenInterface,
    signer
)

const bridgeEth = async (ethAmount: string) => {
    const tx = await contract.depositEth({
        value: ethers.parseEther(ethAmount),
    });
    console.log("Transaction hash on parent chain: ", tx.hash);
    await tx.wait();
    console.log(`${ethAmount} ETHs are deposited to your account`);
};

async function bridge(amount: string) {
	var tx = await erc20Inbox.depositERC20(
        ethers.parseUnits(amount, 18),
    )
    console.log('Transaction hash on parent chain: ', tx.hash)
    await tx.wait()
    console.log('Transaction has been mined')
    console.log(amount + ' native tokens are deposited to your account')
}

async function main() {
    const amount = "1";
    var approveTx = await erc20Token.approve(
        inboxAddr,
        ethers.parseUnits(amount, 18),
    )
    console.log('Approved: ', approveTx.hash)
    bridge(amount);
}

main();
