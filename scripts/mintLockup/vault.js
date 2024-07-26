const { ethers } = require("ethers");
const commandLineArgs = require("command-line-args");
const HttpStatus = require("http-status-codes");
const dotenv = require('dotenv');

dotenv.config()

const optionDefinitions = [
    { name: 'vault', type: String },
    { name: 'token', type: String },
    { name: 'signer', type: String },
    { name: 'func', type: String }
];

const options = commandLineArgs(optionDefinitions)

const provider = ethers.getDefaultProvider(process.env.RPC_URL);
const signerKey = options.signer || process.env.OPERATOR_KEY;
const contractAddress = options.vault || process.env.VAULT_ADDRESS;

async function release(tokenAddress) {
    const signer = new ethers.Wallet(signerKey, provider);
    const iface = new ethers.Interface(["function release(address token) public",
        "event ERC20Released(address indexed, uint256 amount)"])
    const contract = new ethers.Contract(contractAddress, iface, signer);

    try {
        const tx = await contract.release(tokenAddress);
        const txHash = tx.hash;
        const receipt = await tx.wait();
        var hasEvent = false
        var parseLogError;
        for (const log of receipt.logs) {
            try {
                const mLog = iface.parseLog({ topics: log.topics, data: log.data });
                if (mLog && mLog.name === 'ERC20Released') {
                    const token = mLog.args[0]
                    const amount = mLog.args[1]

                    console.log(`Token=${token}, amount=${amount}`)
                    hasEvent = true
                }
            } catch (e) {
                parseLogError = e
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
                message: `Error release at address ${tokenAddress} by reason ${e}`,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            }, null, 2);
    }
}

async function revoke(tokenAddress) {
    const signer = new ethers.Wallet(signerKey, provider);
    const iface = new ethers.Interface(['function revoke(address token) public',
        'event ERC20Revoked(address indexed token)'])
    const contract = new ethers.Contract(contractAddress, iface, signer);

    try {
        const tx = await contract.revoke(tokenAddress);
        const txHash = tx.hash;
        const receipt = await tx.wait();
        var hasEvent = false
        var parseLogError;
        for (const log of receipt.logs) {
            try {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `ERC20Revoked`) {
                    const token = mLog.args[0]
                    console.log(`Token=${token}`)
                    hasEvent = true;
                }
            } catch (e) {
                parseLogError = e
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
                message: `Error revoke at address ${tokenAddress} by reason ${e}`,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            }, null, 2);
    }
}

async function released(tokenAddress) {
    const iface = new ethers.Interface([`function released(address token) public view returns (uint256)`])
    const contract = new ethers.Contract(contractAddress, iface, provider);

    try {
        const releasedAmount = await contract.released(tokenAddress);

        return JSON.stringify(
            {
                amount: Number(releasedAmount) / (10**18),
                statusCode: HttpStatus.OK,
            }, null, 2);
    } catch (e) {
        return JSON.stringify(
            {
                message: `Error calling released at address ${tokenAddress} by reason ${e}`,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            }, null, 2);
    }
}

async function releasable(tokenAddress) {
    const iface = new ethers.Interface([`function releasable(address token) public view returns (uint256)`])
    const contract = new ethers.Contract(contractAddress, iface, provider);

    try {
        const releasableAmount = await contract.releasable(tokenAddress)

        return JSON.stringify(
            {
                amount: Number(releasableAmount) / (10**18),
                statusCode: HttpStatus.OK,
            }, null, 2);
    } catch (e) {
        return JSON.stringify(
            {
                message: `Error calling releasable at address ${tokenAddress} by reason ${e}`,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            }, null, 2);
    }
}

async function main() {
    const tokenAddress = options.token || process.env.TOKEN_ADDRESS

    var response
    if (options.func === `release`) {
        response = await release(tokenAddress)
    } else if (options.func === `revoke`) {
        response = await revoke(tokenAddress)
    } else if (options.func === `released`) {
        response = await released(tokenAddress);
    } else if (options.func === `releasable`) {
        response = await releasable(tokenAddress);
    }
    console.log(response)
}

main()
