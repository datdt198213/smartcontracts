import { expect } from "chai";
import hre from "hardhat";
import { Contract, ethers, Signer, ZeroAddress } from "ethers";
import {
    AccessPassEndpoint__factory,
    AccessPassFactory__factory,
} from "../../typechain-types";

describe("AccessPassEndpoint", function () {
    let owner: Signer,
        operator: Signer,
        proxy: Signer,
        nonOwner: Signer,
        nonOperator: Signer,
        newProxy: Signer,
        receiver: Signer;
    let endpoint: Contract,
        endpointMint: Contract,
        endpointMintAutoIncre: Contract,
        factory: Contract;
    let endpointContract: AccessPassEndpoint__factory,
        factoryContract: AccessPassFactory__factory;

    let name1: string,
        symbol1: string,
        dataPath1: string,
        name2: string,
        symbol2: string,
        dataPath2: string;

    beforeEach(async () => {
        [owner, operator, proxy, nonOwner, nonOperator, newProxy, receiver] =
            await hre.ethers.getSigners();
        endpointContract = await hre.ethers.getContractFactory(
            "AccessPassEndpoint"
        );

        endpoint = await hre.upgrades.deployProxy(
            endpointContract,
            [[await operator.getAddress()], [await proxy.getAddress()]],
            { initializer: "initialize", kind: "uups" }
        );

        factoryContract = await hre.ethers.getContractFactory(
            "AccessPassFactory"
        );

        factory = await hre.upgrades.deployProxy(
            factoryContract,
            [await endpoint.getAddress()],
            { initializer: "initialize", kind: "uups" }
        );

        name1 = "Weapon 1";
        name2 = "Weapon 2";
        symbol1 = "W1";
        symbol2 = "W2";
        dataPath1 = "https://midnight-society.io/metadata/W1/";
        dataPath2 = "https://midnight-society.io/metadata/W2/";
    });

    describe(`Check initialize`, async function () {
        var OPERATOR_ROLE : string;
        var DEFAULT_ADMIN_ROLE : string;

        this.beforeEach(async function () {
            OPERATOR_ROLE = await endpoint.connect(owner).OPERATOR_ROLE();
            DEFAULT_ADMIN_ROLE = await endpoint
                .connect(owner)
                .DEFAULT_ADMIN_ROLE();
        });

        it(`Should initialize endpoint successfully`, async function () {
            expect(endpoint).not.to.be.undefined;
        });

        it("The owner should have admin roles", async function () {
            expect(
                await endpoint
                    .connect(owner)
                    .hasRole(DEFAULT_ADMIN_ROLE, await owner.getAddress())
            ).to.be.equal(true);
        });

        it(`The operator should have operator role`, async function () {
            expect(
                await endpoint
                    .connect(owner)
                    .hasRole(OPERATOR_ROLE, await operator.getAddress())
            ).to.be.equal(true);
        });
    });

    describe("setFactory(address)", async function () {
        it(`Owner can set`, async function () {
            await expect(
                endpoint.connect(owner).setFactory(await factory.getAddress())
            ).not.to.be.reverted;
        });

        it(`A non-owner can not set`, async function () {
            await expect(
                endpoint
                    .connect(nonOwner)
                    .setFactory(await factory.getAddress())
            ).to.be.revertedWithCustomError(
                endpoint,
                "OwnableUnauthorizedAccount"
            );
        });

        it(`Cannot create any collections before setting the factory`, async function () {
            await expect(
                endpoint
                    .connect(operator)
                    .createCollection(name1, symbol1, dataPath1)
            ).to.be.revertedWithoutReason;  
        });
    });

    describe("createCollection(string, string, string)", function () {
        this.beforeEach(async function () {
            await endpoint
                .connect(owner)
                .setFactory(await factory.getAddress());
        });

        it(`Operator role can execute`, async function () {
            await expect(
                endpoint
                    .connect(operator)
                    .createCollection(name1, symbol1, dataPath1)
            ).not.to.be.reverted;
        });

        it(`Non-operator can not execute`, async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .createCollection(name1, symbol1, dataPath1)
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Should emit a CollectionCreated event", async function () {
            const tx = await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1);
            const receipt = await tx.wait();
            const nftAddress = await endpoint
                .connect(operator)
                .getCollectionAddress(name1);

            const iface = new ethers.Interface([
                `event CollectionCreated(string indexed name, string indexed symbol, address indexed contractAddress)`,
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);

                if (mLog && mLog.name === `CollectionCreated`) {
                    const { name, symbol, contractAddress } = mLog.args;
                    expect(
                        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name1))
                    ).to.be.equal(name.hash);
                    expect(
                        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(symbol1))
                    ).to.be.equal(symbol.hash);
                    expect(nftAddress).to.be.equal(contractAddress);

                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it("Creating a duplicated collection should fail", async function () {
            await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1);

            await expect(
                endpoint
                    .connect(operator)
                    .createCollection(name1, symbol1, dataPath1)
            ).to.be.revertedWithCustomError(endpoint, `CollectionExist`);
        });
    });

    describe("mint(string, address, uint256[])", function () {
        let tokenIds: Array<Number>;
        beforeEach(async () => {
            tokenIds = [1, 2, 3];
            let iface = new hre.ethers.Interface([
                "function mint(string memory name,address to,uint256[] memory tokenIds)",
            ]);
            endpointMint = new hre.ethers.Contract(
                await endpoint.getAddress(),
                iface,
                operator
            );

            await endpoint.setFactory(await factory.getAddress());

            await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1);
        });

        it("Using a non-existent collection should fail", async function () {
            let name4 = "Weapon 4";
            await expect(
                endpointMint
                    .connect(operator)
                    .mint(name4, await receiver.getAddress(), tokenIds)
            ).to.be.revertedWithCustomError(endpoint, `NonexistentCollection`);
        });

        it("Non-operator can not execute", async function () {
            await expect(
                endpointMint
                    .connect(nonOperator)
                    .mint(name1, await receiver.getAddress(), tokenIds)
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Operator can mint", async function () {
            await expect(
                endpointMint
                    .connect(operator)
                    .mint(name1, await receiver.getAddress(), tokenIds)
            ).not.to.be.reverted;
        });

        it("Should log Transfer event", async function () {
            const tx = await endpointMint
                .connect(operator)
                .mint(name1, await receiver.getAddress(), tokenIds);
            const receipt = await tx.wait();

            let xferABI = [
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            ];
            let iface = new ethers.Interface(xferABI);

            var hasEvent = false;
            var index = 0;
            for (const log of receipt.logs) {
                let mLog = iface.parseLog(log);
                if (mLog != undefined && mLog.name === "Transfer") {
                    const { from, to, tokenId } = mLog.args;

                    expect(ZeroAddress).to.be.equal(from);
                    expect(await receiver.getAddress()).to.be.equal(to);
                    expect(await tokenId).to.be.equal(tokenIds[index]);
                    index++;

                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it("Minting a zero tokenId should fail", async function () {
            await expect(
                endpointMint
                    .connect(operator)
                    .mint(name1, await receiver.getAddress(), [0])
            ).to.be.revertedWithoutReason;

            await expect(
                endpointMint
                    .connect(operator)
                    .mint(
                        name1,
                        await receiver.getAddress(),
                        [0, 1, 2, 3, 4, 5]
                    )
            ).to.be.revertedWithoutReason;
        });

        it("Minting existen tokens should fail", async function () {
            await endpointMint
                .connect(operator)
                .mint(name1, await receiver.getAddress(), tokenIds);

            await expect(
                endpointMint
                    .connect(operator)
                    .mint(name1, await receiver.getAddress(), [tokenIds[0]])
            ).to.be.reverted;
        });
    });

    describe("mint(string, address)", function () {
        let accessPass: Contract;
        beforeEach(async () => {
            let iface = new hre.ethers.Interface([
                "function mint(string memory name,address to,uint256[] memory tokenIds)",
            ]);

            endpointMint = new hre.ethers.Contract(
                await endpoint.getAddress(),
                iface,
                operator
            );

            iface = new hre.ethers.Interface([
                "function mint(string memory name,address to)",
            ]);

            endpointMintAutoIncre = new hre.ethers.Contract(
                await endpoint.getAddress(),
                iface,
                operator
            );

            await endpoint
                .connect(owner)
                .setFactory(await factory.getAddress());

            await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1);

            const nftContract = await endpoint.getCollectionAddress(name1);

            const ifaceAP = new ethers.Interface([
                "function ownerOf(uint256 tokenId) public view returns (address)",
            ]);
            accessPass = new ethers.Contract(nftContract, ifaceAP, operator);
        });

        it("Using a non-existent collection should fail", async function () {
            let name1 = "Weapon 4";
            await expect(
                endpointMintAutoIncre
                    .connect(operator)
                    .mint(name1, await receiver.getAddress())
            ).to.be.revertedWithCustomError(endpoint, `NonexistentCollection`);
        });

        it("The first minting should succeed with a tokenID of 1", async function () {
            await endpointMintAutoIncre
                .connect(operator)
                .mint(name1, await receiver.getAddress());
            const owner = await accessPass.ownerOf(1);
            expect(owner).to.equal(await receiver.getAddress());
        });

        it("Checking auto-increment tokenId", async function () {
            const tokenIds = [1, 2, 3, 4, 5];
            await endpointMint.mint(
                name1,
                await receiver.getAddress(),
                tokenIds
            );

            await endpointMintAutoIncre
                .connect(operator)
                .mint(name1, await receiver.getAddress());

            let lastMax = tokenIds[0];
            for (let i of tokenIds) {
                if (lastMax < i) {
                    lastMax = i;
                }
            }
            const owner = await accessPass.ownerOf(lastMax + 1);
            expect(owner).to.equal(await receiver.getAddress());
        });

        it("Non-operator cannot execute", async function () {
            await expect(
                endpointMintAutoIncre
                    .connect(nonOperator)
                    .mint(name1, await receiver.getAddress())
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Operator can execute", async function () {
            await expect(
                endpointMintAutoIncre.mint(name1, await proxy.getAddress())
            ).not.to.be.reverted;
        });
    });

    describe("addProxy(address)", function () {
        this.beforeEach(async function () {
            await endpoint.setFactory(await factory.getAddress());
        });

        it("Non-operator can not execute", async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .addProxy(await receiver.getAddress())
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Operator can execute", async function () {
            await expect(
                endpoint.connect(operator).addProxy(await newProxy.getAddress())
            ).not.to.be.reverted;
        });

        it("Proxies list of all collections should be updated", async function () {
            const tx = await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1);
            const receipt = await tx.wait();
            const nftContract = await endpoint.getCollectionAddress(name1);

            const tx2 = await endpoint
                .connect(operator)
                .createCollection(name2, symbol2, dataPath2);
            const receipt2 = await tx2.wait();
            const nftContract2 = await endpoint
                .connect(operator)
                .getCollectionAddress(name2);

            await expect(endpoint.connect(operator).addProxy(nonOperator)).not
                .to.be.reverted;

            const accessPassContract = await hre.ethers.getContractFactory(
                "AccessPass"
            );
            const accessPass1 = accessPassContract.attach(nftContract);
            const accessPass2 = accessPassContract.attach(nftContract2);

            const PROXY_ROLE_HASH = accessPass1.PROXY_ROLE();

            await expect(
                await accessPass1.hasRole(
                    PROXY_ROLE_HASH,
                    await nonOperator.getAddress()
                )
            ).to.equal(true);
            await expect(
                await accessPass2.hasRole(
                    PROXY_ROLE_HASH,
                    await nonOperator.getAddress()
                )
            ).to.equal(true);
        });
    });

    describe("remove(address)", function () {
        this.beforeEach(async function () {
            await endpoint.setFactory(await factory.getAddress());
        });

        it("Non-operator can not execute", async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .removeProxy(await newProxy.getAddress())
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Operator can execute", async function () {
            await expect(endpoint.connect(operator).addProxy(await newProxy))
                .not.to.be.reverted;

            await expect(
                endpoint
                    .connect(operator)
                    .removeProxy(await newProxy.getAddress())
            ).not.to.be.reverted;
        });

        it("Proxies list in all collections should be updated", async function () {
            const tx = await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1);
            const receipt = await tx.wait();
            const nftContract = await endpoint.getCollectionAddress(name1);

            const iface = new hre.ethers.Interface([
                "event CollectionCreated(string indexed name, string indexed symbol, address indexed contractAddress)",
            ]);

            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `CollectionCreated`) {
                    const { name, symbol, contractAddress } = mLog.args;
                    expect(name.hash).to.equal(
                        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name1))
                    );
                    expect(symbol.hash).to.equal(
                        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(symbol1))
                    );
                    expect(contractAddress).to.equal(nftContract);
                }
            }

            const tx2 = await endpoint
                .connect(operator)
                .createCollection(name2, symbol2, dataPath2);
            const receipt2 = await tx2.wait();
            const nftContract2 = await endpoint.getCollectionAddress(name2);

            for (const log of receipt2.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `CollectionCreated`) {
                    const { name, symbol, contractAddress } = mLog.args;
                    expect(name.hash).to.equal(
                        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name2))
                    );
                    expect(symbol.hash).to.equal(
                        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(symbol2))
                    );
                    expect(contractAddress).to.equal(nftContract2);
                }
            }

            await expect(
                endpoint.connect(operator).addProxy(await newProxy.getAddress())
            ).not.to.be.reverted;

            const accessPassContract = await hre.ethers.getContractFactory(
                "AccessPass"
            );
            const accessPass1 = accessPassContract.attach(nftContract);
            const accessPass2 = accessPassContract.attach(nftContract2);

            const PROXY_ROLE_HASH = accessPass1.PROXY_ROLE();

            expect(
                await accessPass1.hasRole(
                    PROXY_ROLE_HASH,
                    await newProxy.getAddress()
                )
            ).to.equal(true);
            expect(
                await accessPass2.hasRole(
                    PROXY_ROLE_HASH,
                    await newProxy.getAddress()
                )
            ).to.equal(true);

            await expect(
                endpoint
                    .connect(operator)
                    .removeProxy(await newProxy.getAddress())
            ).not.to.be.reverted;
            expect(
                await accessPass1.hasRole(
                    PROXY_ROLE_HASH,
                    await newProxy.getAddress()
                )
            ).to.equal(false);
            expect(
                await accessPass2.hasRole(
                    PROXY_ROLE_HASH,
                    await newProxy.getAddress()
                )
            ).to.equal(false);
        });
    });
});
