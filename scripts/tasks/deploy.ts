
task('deployChild', "Deploy token contract to Child chain")
    .addParam('root', 'Token address in Root chain')

    .setAction(async (args, hre) => {
        const token = await hre.ethers.getContractFactory('ChildToken');
        const proxies = process.env.PROXIES.split(' ');
        const gateway = process.env.CHILD_GATEWAY;
        const rootToken = args.root;

        const deployed = await hre.upgrades.deployProxy(token, [gateway, rootToken, proxies], {initialize: "initialize", kind: "uups"});
        console.log(`Deployed child token to: ${await deployed.getAddress()}`);
    })

task('deployRoot', "Deploy token contract to Root chain")
    .setAction(async (args, hre) => {
        const tokenContract = await hre.ethers.getContractFactory('MidnightSociety');
        const operators = process.env.OPERATORS.split(' ');
        const gateway = process.env.ROOT_GATEWAY;
        const router = process.env.ROOT_ROUTER;
        const token = await hre.upgrades.deployProxy(tokenContract, [operators, gateway, router], {initialize: "initialize", kind: "uups"});
        const tokenAddress = await token.getAddress();
        console.log(`Deployed root token to: ${tokenAddress}`);

        const factory = await hre.ethers.getContractFactory('VestingWalletFactory');
        const vault = await hre.upgrades.deployProxy(factory, [tokenAddress], {initialize: "initialize", kind: "uups"});
        const vaultAddress = await vault.getAddress();
        console.log(`Deployed vaultFactory to: ${vaultAddress}`);
        await token.setVaultFactory(vaultAddress);
        console.log(`Done`);
    })
