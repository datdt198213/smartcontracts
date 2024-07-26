task('transfer', "Transfer ERC20 tokens between accounts")
    .addParam('from', 'The tokens owner')
    .addParam('to', 'The beneficiary wallet')
    .addParam('amount', 'Amount of tokens')
    .addParam('token', 'The token address')
    .addParam('key', 'Private key of the tokens owner or the Proxy account')

    .setAction(async (args, hre) => {
        const erc20Interface = new hre.ethers.Interface([
            "function transfer(address, uint256) public",
            "function transferFrom(address, address, uint256) public",
            "function balanceOf(address) public view returns (uint256)",
        ]);
        const provider = hre.ethers.provider;
        const signer = new hre.ethers.Wallet(args.key, provider);
        const contract = new hre.ethers.Contract(args.token, erc20Interface, signer);
        var tx;
        if (hre.ethers.getAddress(signer.address) == hre.ethers.getAddress(args.from)) {
            tx = await contract.transfer(args.to, ethers.parseEther(args.amount));
        } else {
            tx = await contract.transferFrom(args.from, args.to, ethers.parseEther(args.amount));
        }
        const rc = await tx.wait();
        if (rc.status == 1) {
            const fromBalance = hre.ethers.formatEther(await contract.balanceOf(args.from));
            const toBalance = hre.ethers.formatEther(await contract.balanceOf(args.to));
            console.log(`Success! Current balance: from=${fromBalance}, to=${toBalance} `);
        } else {
            console.log(`Fail with: {rc}`);
        }
    })
