import { expect } from "chai";
import { Contract, Signer } from "ethers";
import hre from "hardhat";
import { AccessPassFactory__factory } from "../../typechain-types";

describe("AccessPassFactory", function () {
    let owner : Signer, endpoint : Signer, proxy : Signer, nonEndpoint : Signer, admin : Signer;
    let factoryContract : AccessPassFactory__factory, factory : Contract;

    let name : string = "Weapon 1";
    let symbol : string = "W1";

    beforeEach(async () => {
        [owner, endpoint, proxy, nonEndpoint, admin] = await hre.ethers.getSigners();
        factoryContract = await hre.ethers.getContractFactory(
            "AccessPassFactory"
        );
    });

    it(`Shoud initialize contract successfully`, async function () {
        factory = await hre.upgrades.deployProxy(factoryContract, [await endpoint.getAddress()], {initializer: "initialize", kind: "uups"});

        expect(factory).not.to.be.undefined;
    })

    describe("create(string, string, address, address[])", function () {

        this.beforeEach(async () => {
            factory = await hre.upgrades.deployProxy(factoryContract, [await endpoint.getAddress()], {initializer: "initialize", kind: "uups"});
        })

        it("Should revert with a non-endpoint sender", async function () {
            await expect(factory.connect(nonEndpoint).create(name, symbol, await admin.getAddress(), [await proxy.getAddress()])).to.be.revertedWith('INVALID_SENDER')
        });

        it("The endpoint can execute", async function () {
            await expect(factory.connect(endpoint).create(name, symbol, await admin.getAddress(), [await proxy.getAddress()])).not.to.be.reverted
        });
    });
});
