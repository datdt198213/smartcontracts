
task('gen', "Generate a new EVM wallet")

    .setAction(async (args, hre) => {
        const wallet = hre.ethers.Wallet.createRandom();
        console.log(`Address: `, wallet.address)
        console.log(`Private key:`, wallet.privateKey)
    })
