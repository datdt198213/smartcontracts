import hre from 'hardhat'

(async () => {
    const endpointContract = await hre.ethers.getContractFactory('TestPass');
    const operators = [
        '0xc2CCcfd3215A44104D74c5188217574c92d9d745',
    ]
    const proxies = [
        '0x8c3AE5DbE2900bfBA1Bdb7606D93a96362b0DB33',
        '0x073F34B75d48fBf1847c045Df1C5b51ed007c46F'
    ]
    const signers = await hre.ethers.getSigners()
    for (const signer of signers)  {
        console.log(`Wallet: ${await signer.getAddress()}`)
    }

    const accessPassToken = await hre.ethers.deployContract("TestPass", [operators, true, proxies])
    console.log(`Contract Address: ${await accessPassToken.getAddress()}`)
})()

