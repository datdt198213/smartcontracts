task('mint', "Mint root tokens to target wallet")
    .addParam('to', 'The beneficiary wallet')
    .addParam('amount', 'Amount of tokens')
    .addParam('token', 'The root token address')
    .addParam('key', 'Private key of the Operator account (an operator of the root token)')

    .setAction(async (args, hre) => {
        const erc20Interface = new hre.ethers.Interface([
            "function mint(address, uint256) public",
            "function balanceOf(address) public view returns (uint256)",
        ]);
        const provider = hre.ethers.provider;
        const signer = new hre.ethers.Wallet(args.key, provider);
        const contract = new hre.ethers.Contract(args.token, erc20Interface, signer);
        const tx = await contract.mint(args.to, ethers.parseEther(args.amount));
        const rc = await tx.wait();
        if (rc.status == 1) {
            const balance = await contract.balanceOf(args.to);
            const bal = hre.ethers.formatEther(balance)
            console.log(`Success! Current balance: ${bal} `);
        } else {
            console.log(`Fail with: {rc}`);
        }
    })
