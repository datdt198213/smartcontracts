import { ethers } from "ethers";

task('xferEth', "Transfer ETH to a specified account")
    .addParam('to', 'The beneficiary wallet')
    .addParam('amount', 'Amount of ETH')
    .addParam('key', 'Private key of the signer')

    .setAction(async (args, hre) => {
        const provider = hre.ethers.provider;
        const signer = new hre.ethers.Wallet(args.key, provider);
        const feeData = await provider.getFeeData();

        const tx = await signer.sendTransaction({
            to: args.to,
            value: ethers.parseEther(args.amount),
            type: 2,
            maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"]._hex,
            maxFeePerGas: feeData["maxFeePerGas"],
        });
        const rc = await tx.wait();
        if (rc.status == 1) {
            console.log("Done!");
        }
    })
