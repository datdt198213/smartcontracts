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
        receiver: Signer,
        admin: Signer;
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

    const proxyRole = "0x77d72916e966418e6dc58a19999ae9934bef3f749f1547cde0a86e809f19c89b";
    const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";

    beforeEach(async () => {
        [owner, operator, proxy, nonOwner, nonOperator, newProxy, receiver, admin] =
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
                    .createCollection(name1, symbol1, dataPath1, await admin.getAddress())
            ).to.be.revertedWithoutReason;  
        });
    });

    describe("createCollection(string, string, string, address)", function () {
        this.beforeEach(async function () {
            await endpoint
                .connect(owner)
                .setFactory(await factory.getAddress());
        });

        it(`Operator role can execute`, async function () {
            await expect(
                endpoint
                    .connect(operator)
                    .createCollection(name1, symbol1, dataPath1, await admin.getAddress())
            ).not.to.be.reverted;
        });

        it(`Non-operator can not execute`, async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .createCollection(name1, symbol1, dataPath1, await admin.getAddress())
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Should emit a CollectionCreated event", async function () {
            const tx = await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1, await admin.getAddress());
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
                .createCollection(name1, symbol1, dataPath1, await admin.getAddress());

            await expect(
                endpoint
                    .connect(operator)
                    .createCollection(name1, symbol1, dataPath1, await admin.getAddress())
            ).to.be.revertedWithCustomError(endpoint, `CollectionExist`);
        });

        it('Admin should has an admin role and be the owner of the newly created collection', async function () {
            await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1, await admin.getAddress());

            const collectionAddr = await endpoint.connect(operator).getCollectionAddress(name1);
            const iface = new ethers.Interface([
                'function hasRole(bytes32 role, address account) external view returns (bool)',
                'function owner() public view returns (address)'
            ])
            const accessPass = new ethers.Contract(collectionAddr, iface, admin);

            expect(await accessPass.connect(admin).hasRole(adminRole, await admin.getAddress())).equal(true)
            expect(await accessPass.connect(admin).owner()).equal(await admin.getAddress())
        })  
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

            await endpoint.connect(owner).setFactory(await factory.getAddress());

            await endpoint
                .connect(operator)
                .createCollection(name1, symbol1, dataPath1, await admin.getAddress());
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
                .createCollection(name1, symbol1, dataPath1, await admin.getAddress());

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

    describe("addProxy(address, address[])", function () {
        var collection1: string;
        var collection2: string;
        this.beforeEach(async function () {
            await endpoint.connect(owner).setFactory(await factory.getAddress());

            await endpoint.connect(operator).createCollection(name1, symbol1, dataPath1, await admin.getAddress());
            collection1 = await endpoint.connect(operator).getCollectionAddress(name1);

            await endpoint.connect(operator).createCollection(name2, symbol2, dataPath2, await admin.getAddress());
            collection2 = await endpoint.connect(operator).getCollectionAddress(name2);
        });

        it("Non-operator can not execute", async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .addProxy(await newProxy.getAddress(), [collection1, collection2])
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Operator can execute", async function () {
            await expect(
                endpoint.connect(operator).addProxy(await newProxy.getAddress(), [collection1, collection2])
            ).not.to.be.reverted;
        });

        it("Should fail with a zero proxy address", async function () {
            await expect(
                endpoint.connect(operator).addProxy(ZeroAddress, [collection1, collection2])
            ).to.be.reverted;
        });

        it("Should fail with any zero collection address", async function () {
            await expect(
                endpoint.connect(operator).addProxy(await newProxy.getAddress(), [collection1, ZeroAddress])
            ).to.be.reverted;
            await expect(
                endpoint.connect(operator).addProxy(await newProxy.getAddress(), [ZeroAddress, collection2])
            ).to.be.reverted;
        });

        it("Should fail with any empty collections list", async function () {
            await expect(
                endpoint.connect(operator).addProxy(await newProxy.getAddress(), [])
            ).to.be.reverted;
        });

        it("Proxies list of specified collections should be updated", async function () {
            await expect(endpoint.connect(operator).addProxy(await newProxy.getAddress(), [collection1, collection2])).not
                .to.be.reverted;

            const iface = new ethers.Interface(['function hasRole(bytes32 role, address account) external view returns (bool)']);
            const accessPass1 = new ethers.Contract(collection1, iface, newProxy);
            const accessPass2 = new ethers.Contract(collection2, iface, newProxy);

            expect(
                await accessPass1.hasRole(
                    proxyRole,
                    await newProxy.getAddress()
                )
            ).to.equal(true);
            expect(
                await accessPass2.hasRole(
                    proxyRole,
                    await newProxy.getAddress()
                )
            ).to.equal(true);
        });
    });

    describe("removeProxy(address, address[])", function () {
        var collection1: string, collection2: string;
        this.beforeEach(async function () {
            await endpoint.connect(owner).setFactory(await factory.getAddress());

            await endpoint.connect(operator).createCollection(name1, symbol1, dataPath1, await admin.getAddress());
            collection1 = await endpoint.connect(operator) .getCollectionAddress(name1);

            await endpoint.connect(operator).createCollection(name2, symbol2, dataPath2, await admin.getAddress());
            collection2 = await endpoint.connect(operator).getCollectionAddress(name2);

            await endpoint.connect(operator).addProxy(await newProxy.getAddress(), [collection1, collection2]);
        });

        it("Non-operator can not execute", async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .removeProxy(await newProxy.getAddress(), [collection1, collection2])
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Operator can execute", async function () {
            await expect(
                endpoint
                    .connect(operator)
                    .removeProxy(await newProxy.getAddress(), [collection1, collection2])
            ).not.to.be.reverted;
        });

        it("Should fail with a zero proxy address", async function () {
            await expect(
                endpoint.connect(operator).removeProxy(ZeroAddress, [collection1, collection2])
            ).to.be.reverted;
        });

        it("Should fail with any zero collection address", async function () {
            await expect(
                endpoint.connect(operator).removeProxy(await newProxy.getAddress(), [collection1, ZeroAddress])
            ).to.be.reverted;
            await expect(
                endpoint.connect(operator).removeProxy(await newProxy.getAddress(), [ZeroAddress, collection2])
            ).to.be.reverted;
        });

        it("Should fail with any empty collections list", async function () {
            await expect(
                endpoint.connect(operator).removeProxy(await newProxy.getAddress(), [])
            ).to.be.reverted;
        });

        it("Proxies list of specified collections should be updated", async function () {
            const iface = new ethers.Interface(['function hasRole(bytes32 role, address account) external view returns (bool)']);
            const accessPass1 = new ethers.Contract(collection1, iface, newProxy);
            const accessPass2 = new ethers.Contract(collection2, iface, newProxy);

            expect(
                await accessPass1.hasRole(
                    proxyRole,
                    await newProxy.getAddress()
                )
            ).to.equal(true);
            expect(
                await accessPass2.hasRole(
                    proxyRole,
                    await newProxy.getAddress()
                )
            ).to.equal(true);

            await expect(
                endpoint
                    .connect(operator)
                    .removeProxy(await newProxy.getAddress(), [collection1, collection2])
            ).not.to.be.reverted;
            expect(
                await accessPass1.hasRole(
                    proxyRole,
                    await newProxy.getAddress()
                )
            ).to.equal(false);
            expect(
                await accessPass2.hasRole(
                    proxyRole,
                    await newProxy.getAddress()
                )
            ).to.equal(false);
        });
    });

    describe('addToSet(address[])', function () {
        this.beforeEach(async function () {
            await endpoint
                .connect(owner)
                .setFactory(await factory.getAddress());
        });

        it("Operator can execute", async function () {
            await expect(endpoint.connect(operator).addToSet([await newProxy.getAddress()])).not.to.be.reverted;
        });

        it("Non-operator cannot execute", async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .addToSet([await newProxy.getAddress()])
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Can't add a null address as proxy", async function () {
            await expect(
                endpoint
                    .connect(operator)
                    .addToSet([ZeroAddress])
            ).to.be.reverted;
        });

        it("Should fail with any empty list", async function () {
            await expect(
                endpoint.connect(operator).addToSet([])
            ).to.be.reverted;
        });

        it("Can't add an existed proxy to set", async function () {
            await expect(endpoint.connect(operator).addToSet([await newProxy.getAddress()])).not.to.be.reverted;

            await expect(
                endpoint
                    .connect(operator)
                    .addToSet([await newProxy.getAddress()])
            ).to.be.revertedWithCustomError(endpoint, "ProxyExist");
        });

        it('Added item should have a proxy role in any new collection', async function () {
            await expect(endpoint.connect(operator).addToSet([await newProxy.getAddress()])).not.reverted;

            await expect(endpoint.connect(operator).createCollection(name1, symbol1, dataPath1, await admin.getAddress())).not.reverted;
            await expect(endpoint.connect(operator).createCollection(name2, symbol2, dataPath2, await admin.getAddress())).not.reverted;
            const collection1 = await endpoint.connect(operator).getCollectionAddress(name1);
            const collection2 = await endpoint.connect(operator).getCollectionAddress(name2);

            const iface = new ethers.Interface(['function hasRole(bytes32 role, address account) external view returns (bool)'])
            const accessPass1 = new ethers.Contract(collection1, iface, newProxy);
            const accessPass2 = new ethers.Contract(collection2, iface, newProxy);

            expect(await accessPass1.connect(newProxy).hasRole(proxyRole, await newProxy.getAddress())).equal(true);
            expect(await accessPass2.connect(newProxy).hasRole(proxyRole, await newProxy.getAddress())).equal(true);
        });
    })

    describe('removeFromSet(address[])', function () {
        this.beforeEach(async function () {
            await endpoint.connect(owner).setFactory(await factory.getAddress());
            await endpoint.connect(operator).addToSet([await newProxy.getAddress()]);
        })

        it("Operator can execute", async function () {
            await expect(endpoint.connect(operator).removeFromSet([await newProxy.getAddress()])).not.to.be.reverted;
        });

        it("Non-operator cannot execute", async function () {
            await expect(
                endpoint
                    .connect(nonOperator)
                    .removeFromSet([await newProxy.getAddress()])
            ).to.be.revertedWithCustomError(
                endpoint,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Should fail with any empty list", async function () {
            await expect(
                endpoint.connect(operator).removeFromSet([])
            ).to.be.reverted;
        });

        it("Should fail with any zero address", async function () {
            await expect(
                endpoint.connect(operator).removeFromSet([ZeroAddress])
            ).to.be.reverted;
            await expect(
                endpoint.connect(operator).removeFromSet([await newProxy.getAddress(), ZeroAddress])
            ).to.be.reverted;
            await expect(
                endpoint.connect(operator).removeFromSet([ZeroAddress, await newProxy.getAddress()])
            ).to.be.reverted;
        });

        it("Can't remove a non-existent item", async function () {
            await expect(endpoint.connect(operator).removeFromSet([await newProxy.getAddress()])).not.to.be.reverted;

            await expect(
                endpoint
                    .connect(operator)
                    .removeFromSet([await newProxy.getAddress()])
            ).to.be.revertedWithCustomError(endpoint, "NonexistentProxy");
        })

        it('Removed item should not have a proxy role in any new collection', async function () {
            const iface = new ethers.Interface(['function hasRole(bytes32 role, address account) external view returns (bool)']);
            await expect(endpoint.connect(operator).createCollection(name1, symbol1, dataPath1, await admin.getAddress())).not.reverted;
            const collection1 = await endpoint.connect(operator).getCollectionAddress(name1);
            const accessPass1 = new ethers.Contract(collection1, iface, newProxy);

            expect(await accessPass1.connect(newProxy).hasRole(proxyRole, await newProxy.getAddress())).equal(true);

            await expect(endpoint.connect(operator).removeFromSet([await newProxy.getAddress()])).not.reverted

            await expect(endpoint.connect(operator).createCollection(name2, symbol2, dataPath2, await admin.getAddress())).not.reverted;
            const collection2 = await endpoint.connect(operator).getCollectionAddress(name2);
            const accessPass2 = new ethers.Contract(collection2, iface, newProxy);

            expect(await accessPass2.connect(newProxy).hasRole(proxyRole, await newProxy.getAddress())).equal(false);
        })
    })
});
