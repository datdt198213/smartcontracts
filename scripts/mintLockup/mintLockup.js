const { ethers, Contract, Wallet, Interface } = require("ethers");
const commandLineArgs = require("command-line-args");
const HttpStatus = require("http-status-codes");
const dotenv = require('dotenv')
const fs = require('fs')

dotenv.config()

const optionDefinitions = [
    { name: 'token', type: String },
    { name: 'beneficiary', type: String },
    { name: 'start', type: String },
    { name: 'cliff', type: String },
    { name: 'end', type: String },
    { name: 'operator', type: String },
    { name: 'revocable', type: Boolean, defaultValue:true },
    { name: 'amount', type: Number },
    { name: 'data', type: String },
    { name: 'signer', type: String }
];

const options = commandLineArgs(optionDefinitions)

const provider = ethers.getDefaultProvider(process.env.RPC_URL);
const signerKey = options.signer || process.env.OPERATOR_KEY
const contractAddress = options.token || process.env.TOKEN_ADDRESS
const signer = new Wallet(signerKey, provider)

async function mintLockup(beneficiary, start, cliff, end, operator, revocable, amount) {
    const startSeconds = BigInt(new Date(start) / 1000)
    const cliffSeconds = BigInt(new Date(cliff) / 1000) - BigInt(startSeconds)
    const durationSeconds = BigInt(new Date(end) / 1000) - BigInt(startSeconds)

    const iface = new Interface([
        "function mintLockup(address beneficiary, uint64 start, uint64 cliff, uint64 duration, address operator, bool revocable, uint256 amount) public",
        "function decimals() public view returns (uint8)",
        "event MintLockUp(address indexed vaultAddress, address indexed beneficiary, uint64 start, uint64 cliff, uint64 duration, address operator, bool revocable, uint256 amount)"
    ]);
    const contract = new Contract(contractAddress, iface, signer);

    const decimals = await contract.decimals();
    const amountDecimals = BigInt(amount) * BigInt(10n ** decimals);

    try {
        const tx = await contract.mintLockup(beneficiary, startSeconds, cliffSeconds, durationSeconds, operator, revocable, amountDecimals)
        const txHash = tx.hash
        var hasEvent = false
        const receipt = await tx.wait();
        var parseLogError;
        for (const log of receipt.logs) {
            try {
                const mLog = iface.parseLog({ topics: log.topics, data: log.data });
                if (mLog && mLog.name === 'MintLockUp') {
                    const { vaultAddress, beneficiary, start, cliff, duration, operator, revocable, amount } = mLog.args;
                    hasEvent = true

                    console.log(`Vault=${vaultAddress}, beneficiary=${beneficiary}, start=${start}, cliff=${cliff}, duration=${duration}, operator=${operator}, revocable=${revocable}, amount=${amount}`);
                }
            } catch (e) {
                parseLogError = e;
                break;
            }
        }
        if (parseLogError !== undefined) {
            throw new Error(`Transaction was sent to chain with hash ${txHash} but got error when getting log event: ${parseLogError}`);
        } else if (hasEvent === false){
            throw new Error(`Event Not Found`);
        } else {
            return JSON.stringify(
                {
                    txHash: txHash,
                    statusCode: HttpStatus.OK,
                }, null, 2);
        }
    } catch (e) {
        return JSON.stringify(
            {
                message: `Error when mintLockup ${beneficiary} by reason ${e}`,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            }, null, 2);
    }

}

async function main() {

    if (options.data !== undefined) {
        try {
            const jsonData = JSON.parse(fs.readFileSync(options.data, 'utf-8'));
            for (const data of jsonData) {
                var tmpOperator
                if (data.operator !== undefined) {
                    tmpOperator = data.operator
                } else {
                    tmpOperator = await signer.getAddress()
                }
                const response = await mintLockup(data.beneficiary, data.start, data.cliff, data.end, tmpOperator, data.revocable, data.amount)

                console.log(response)
            }
        } catch (e) {
            console.error(`Error when read file json: ${e}`)
        }
        
    } else {
        var tmpOperator
                if (options.operator !== undefined) {
                    tmpOperator = options.operator
                } else {
                    tmpOperator = await signer.getAddress()
                }
        const response = await mintLockup(options.beneficiary, options.start, options.cliff, options.end, tmpOperator, options.revocable, options.amount);
        console.log("🚀 ~ main ~ response:", response)
    }
}

main()
