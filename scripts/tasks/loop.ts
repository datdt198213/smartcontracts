
task('loop', "loop transfer ETH between two special accounts")

    .setAction(async (args, hre) => {
        const provider = hre.ethers.provider;
        const feeData = await provider.getFeeData();
        const accounts = await hre.ethers.getSigners();
        const signer1 = accounts[0];
        const signer2 = accounts[1];
        const amount = '0.000001';
        const MAX_LOOP = 2000;
        
        for (var i = 1; i <= MAX_LOOP; i++) {
            const tx1 = await signer1.sendTransaction({
                to: signer2.address,
                value: hre.ethers.parseEther(amount),
                type: 2,
                maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"]._hex,
                maxFeePerGas: feeData["maxFeePerGas"],
            });
            await tx1.wait();

            const tx2 = await signer2.sendTransaction({
                to: signer1.address,
                value: hre.ethers.parseEther(amount),
                type: 2,
                maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"]._hex,
                maxFeePerGas: feeData["maxFeePerGas"],
            });
            await tx2.wait();

            console.log(`Total transaction ${i * 2}`);
        }

        console.log(`Done!`);
    })
