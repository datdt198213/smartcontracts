import { expect } from "chai";
import { Contract, Signer, ZeroAddress } from "ethers";
import hre from "hardhat";
import { AccessPass__factory } from "../../typechain-types";
import { seaport } from "@opensea/seaport-js/lib/typechain-types";

describe("AccessPass", function () {
    let accessPass: Contract;
    let accessPassContract: AccessPass__factory;
    let name: string,
        symbol: string,
        adminAddress: string,
        receiverAddress : string,
        proxyAddress : string;
    let deployer: Signer,
        admin: Signer,
        nonAdmin: Signer,
        endpoint: Signer,
        nonEndpoint: Signer,
        operator: Signer,
        receiver: Signer,
        proxy: Signer,
        nonApproval: Signer;

    const baseURLDisplay = "https://midnight-studio.io/metadata/";
    const baseURLOriginal = "ipfs://abcxyz/";
    const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const opRole = "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929";
    const proxyRole = "0x77d72916e966418e6dc58a19999ae9934bef3f749f1547cde0a86e809f19c89b";

    beforeEach(async () => {
        [deployer, admin, nonAdmin, endpoint, nonEndpoint, operator, proxy, receiver, nonApproval] =
            await hre.ethers.getSigners();
        name = "Weapon 1";
        symbol = "W1";

        adminAddress = await admin.getAddress();
        receiverAddress = await receiver.getAddress();
        proxyAddress = await proxy.getAddress();

        accessPassContract = await hre.ethers.getContractFactory("AccessPass");
        accessPass = await accessPassContract
            .connect(deployer)
            .deploy(
                name,
                symbol,
                await admin.getAddress(),
                await endpoint.getAddress(),
                [await proxy.getAddress()]
            );
    });

    describe("Initialize successfully", async function () {
        it("The endpoint should have operator and admin roles", async function () {
            expect(
                await accessPass.connect(endpoint).hasRole(
                    opRole,
                    await endpoint.getAddress()
                )
            ).to.be.equal(true);
            expect(
                await accessPass.connect(endpoint).hasRole(
                    adminRole,
                    await endpoint.getAddress()
                )
            ).to.be.equal(true);
        });

        it(`The admin wallet should have Admin role`, async function () {
            expect(
                await accessPass.connect(admin).hasRole(adminRole, admin)
            ).to.be.equal(true);
        });
    });

    describe("freezeBaseOriginalURI()", async function () {
        it("Owner can freeze", async function () {
            await accessPass.connect(admin).setBaseOriginalURL(baseURLOriginal);
            await expect(accessPass.connect(admin).freezeBaseOriginalURI()).not.to.be.reverted;
        });

        it("Non-owner can not freeze", async function () {
            await accessPass.connect(admin).setBaseOriginalURL(baseURLOriginal);
            await expect(
                accessPass.connect(nonAdmin).freezeBaseOriginalURI()
            ).to.be.revertedWithCustomError(
                accessPass,
                "OwnableUnauthorizedAccount"
            );
        });

        it("Should fail if base original url is not set", async function () {
            await expect(
                accessPass.connect(admin).freezeBaseOriginalURI()
            ).to.be.reverted;
        });

        it("Freezing the base original URI should succeed", async function () {
            await accessPass.connect(admin).setBaseOriginalURL(baseURLOriginal);
            await accessPass.connect(admin).freezeBaseOriginalURI();
            expect(await accessPass.connect(admin).frozen()).to.equal(true);
        });
    });

    describe("setBaseOriginalURL(string)", async function () {
        const baseURL = baseURLOriginal;

        it("Owner can execute", async function () {
            await expect(accessPass.connect(admin).setBaseOriginalURL(baseURL)).not.to.be
                .reverted;
        });

        it("Operator can execute", async function () {
            await expect(accessPass.connect(endpoint).setBaseDisplayURL(baseURL))
                .not.to.be.reverted;
        });

        it("Non-owner and non-operator can not execute", async function () {
            await expect(
                accessPass.connect(nonAdmin).setBaseDisplayURL(baseURL)
            ).to.be.reverted;
        });

        it("Base original URL should be set successfully", async function () {
            await accessPass.connect(admin).setBaseOriginalURL(baseURL);
            const tokenIds = [1, 2, 3, 4];
            await accessPass.connect(endpoint).mint(receiverAddress, tokenIds);

            for (let tokenId of tokenIds) {
                const originalURI = await accessPass.connect(admin).getOriginalURI(tokenId)
                expect(originalURI).to.be.equal(
                    `${baseURL}${tokenId}`
                );
            }
        });

        it("Empty string should not be set", async function () {
            const newBaseURL = "";
            await expect(
                accessPass.connect(admin).setBaseOriginalURL(newBaseURL)
            ).to.be.reverted;
        });

        it(`Should fail when frozen`, async function () {
            await accessPass.connect(admin).setBaseOriginalURL(baseURLOriginal);
            await accessPass.connect(admin).freezeBaseOriginalURI()
            await expect(accessPass.connect(admin).setBaseOriginalURL(baseURL)).to.be.revertedWithoutReason
        })
    });

    describe("setBaseDisplayURL(string)", async function () {
        const baseURL = baseURLDisplay;

        it("Owner can execute", async function () {
            await expect(accessPass.connect(admin).setBaseDisplayURL(baseURL)).not.to.be.reverted;
        });

        it("Operator can execute", async function () {
            await expect(accessPass.connect(endpoint).setBaseDisplayURL(baseURL)).not.to
                .be.reverted;
        });

        it("Non-owner and non-operator can not execute", async function () {
            await expect(
                accessPass.connect(nonAdmin).setBaseDisplayURL(baseURL)
            ).to.be.reverted;
        });

        it("Base display URL should be set successfully", async function () {
            await accessPass.connect(admin).setBaseDisplayURL(baseURL);
            const tokenIds = [1, 2, 3, 4];
            await accessPass.connect(endpoint).mint(receiverAddress, tokenIds);
            for (let tokenId of tokenIds) {
                const displayURI = await accessPass.connect(admin).getDisplayURI(tokenId)
                 expect(displayURI).to.be.equal(
                    `${baseURL}${tokenId}`
                );
            }
        });

        it("Empty string should not be set", async function () {
            const newBaseURL = "";
            await expect(
                accessPass.connect(admin).setBaseDisplayURL(newBaseURL)
            ).to.be.reverted;
        });
    });

    describe("switchURL()", async function () {
        it("Owner can execute", async function () {
           await expect(accessPass.connect(admin).switchURL()).not.to.be.reverted;
        });

        it("Operator role can execute", async function () {
            await expect(accessPass.connect(endpoint).switchURL()).not.to.be.reverted;
        });

        it("Non-owner and non-operator can not execute", async function () {
            await expect(accessPass.connect(proxy).switchURL()).to.be.reverted;
        });

        it(`Switching URL should be correctly`, async function () {
            const tokenIds = [1, 2, 3, 4, 5];
            await accessPass.connect(admin).setBaseOriginalURL(baseURLOriginal);
            await accessPass.connect(admin).setBaseDisplayURL(baseURLDisplay);
            await accessPass.connect(admin).switchURL();

            await accessPass.connect(endpoint).mint(receiverAddress, tokenIds);
            for (let tokenId of tokenIds) {
                const uri = await accessPass.connect(admin).tokenURI(tokenId)
                expect(
                    uri
                ).to.be.equal(`${baseURLOriginal}${tokenId}`);
            }

            await accessPass.connect(admin).switchURL();
            for (let tokenId of tokenIds) {
                const uri = await accessPass.connect(admin).tokenURI(tokenId)
                expect(
                    uri
                ).to.be.equal(`${baseURLDisplay}${tokenId}`);
            }
        });
    });

    describe("mint(address, uint256[])", async function () {
        let tokenIds : Array<Number>;

        beforeEach(async () => {
            tokenIds = [1, 2, 3, 4, 5];
        });
        it("Owner can mint", async function () {
            await expect(accessPass.connect(admin).mint(receiverAddress, tokenIds)).not.to.be
                .reverted;
        });

        it("Operator can mint", async function () {
           await expect(accessPass.connect(endpoint).mint(receiverAddress, tokenIds))
                .not.to.be.reverted;
        });

        it("Non-owner and non-operator can not mint", async function () {
            await expect(
                accessPass.connect(nonAdmin).mint(receiverAddress, tokenIds)
            ).to.be.reverted;

            await expect(
                accessPass.connect(nonEndpoint).mint(receiverAddress, tokenIds)
            ).to.be.reverted;
        });

        it("Should fail with a zero tokenID", async function () {
            await expect(accessPass.connect(endpoint).mint(receiverAddress, [0])).to.be.revertedWithoutReason
        });

        it("Should emit Transfer event", async function () {
            const receipt = await mint(accessPass, endpoint, receiverAddress, tokenIds);

            var hasEvent = false;
            const iface = new ethers.Interface([
                `event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`,
            ]);

            var count = 0;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);

                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, tokenId } = mLog.args;
                    expect(from).to.be.equal(ZeroAddress);
                    expect(to).to.be.equal(receiverAddress);
                    expect(tokenId).to.be.equal(tokenIds[count]);
                    count++;
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it("Minting existing tokens should fail", async function () {
            await mint(accessPass, endpoint, receiverAddress, tokenIds)
            await expect(
                accessPass.connect(endpoint).mint(receiverAddress, tokenIds)
            ).to.be.revertedWithCustomError(accessPass, `ERC721InvalidSender`);
        });
    });

    describe("burn(uint256)", async function () {
        let tokenIdBurn, tokenIds;

        beforeEach(async function () {
            tokenIds = [1, 2, 3, 4, 5];
            tokenIdBurn = tokenIds[0];
            await mint(accessPass, endpoint, receiverAddress, tokenIds)
        });
        it("The contract owner cannot execute", async function () {
            await expect(accessPass.connect(admin).burn(tokenIdBurn)).to.be.revertedWith(
                "Caller is not owner nor approved"
            );
        });

        it("Operator can not execute", async function () {
            await expect(
                accessPass.connect(endpoint).burn(tokenIdBurn)
            ).to.be.revertedWith("Caller is not owner nor approved");
        });

        it("Proxy can burn", async function () {
            await expect(accessPass.connect(proxy).burn(tokenIdBurn)).not.to.be
                .reverted;
        });

        it("Token owner can burn", async function () {
            await expect(accessPass.connect(receiver).burn(tokenIdBurn)).not.to
                .be.reverted;
        });

        it("Non-token owner and non-approved accounts cannot execute", async function () {
            await expect(
                accessPass.connect(nonApproval).burn(tokenIdBurn)
            ).to.be.revertedWith("Caller is not owner nor approved");
        });

        it("Should fail with a non-existent tokenID", async function () {
            tokenIdBurn = 6;
            await expect(
                accessPass.connect(proxy).burn(tokenIdBurn)
            ).to.be.revertedWithCustomError(
                accessPass,
                `ERC721NonexistentToken`
            );
        });

        it("Burned tokens should not exist anymore", async function () {
            await expect(accessPass.connect(proxy).burn(tokenIdBurn)).not.to.be.reverted;
            await expect(
                accessPass.ownerOf(tokenIdBurn)
            ).to.be.revertedWithCustomError(
                accessPass,
                "ERC721NonexistentToken"
            );

            tokenIdBurn = tokenIds[1];
            await expect(accessPass.connect(receiver).burn(tokenIdBurn)).not.to.be.reverted;
            await expect(
                accessPass.ownerOf(tokenIdBurn)
            ).to.be.revertedWithCustomError(
                accessPass,
                "ERC721NonexistentToken"
            );
        });

        it("Should emit Transfer event", async function () {
            const tx = await accessPass.connect(proxy).burn(tokenIdBurn);
            const receipt = await tx.wait();

            var hasEvent = false;
            const iface = new ethers.Interface([
                `event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`,
            ]);

            var count = 0;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);

                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, tokenId } = mLog.args;
                    expect(from).to.be.equal(receiverAddress);
                    expect(to).to.be.equal(ZeroAddress);
                    expect(tokenId).to.be.equal(tokenIdBurn);
                    count++;
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });
    });

    describe("setProxyApproval(bool)", async function () {
        it("Owner can set", async function () {
            await expect(accessPass.connect(admin).setProxyApproval(true)).not.to.be.reverted;
        });

        it("Non-owner can not set", async function () {
            await expect(accessPass.connect(admin).setProxyApproval(true)).not.to.be
                .reverted;
        });

        it("Setting proxyApproval to false will make the proxy role cannot burn nor transfer", async function () {
            await accessPass.connect(admin).setProxyApproval(false);
            await accessPass.connect(endpoint).mint(await receiver.getAddress(), [1, 2, 3, 4]);

            await expect(accessPass.connect(proxy).burn(1)).to.be.revertedWith(
                `Caller is not owner nor approved`
            );
            await expect(accessPass.connect(proxy).transferFrom(await receiver.getAddress(), await admin.getAddress(), 1)).to.be.revertedWithCustomError(accessPass, 'ERC721InsufficientApproval');
        });
    });

    describe(`setApprovalForAll(address, bool)`, async function () {

        let tokenIds : Array<Number>
        this.beforeEach(async function () {
            tokenIds = [1,2,3,4,5,6]
            await mint(accessPass, endpoint, receiverAddress, tokenIds);
        })

        it(`Should emit ApprovalForAll event`, async function () {
            const approvedInput : boolean = true;
            const receipt = await setApprovalForAll(accessPass, receiver, await endpoint.getAddress(), approvedInput)
            const iface = new ethers.Interface(['event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'])

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `ApprovalForAll`) {
                    const {owner, operator, approved} = mLog.args
                    expect(owner).to.be.equal(receiverAddress)
                    expect(operator).to.be.equal(await endpoint.getAddress())
                    expect(approved).to.be.equal(approvedInput)
                    hasEvent = true;
                }
            }
            expect(hasEvent).to.be.equal(true)
        })

        it(`An approved account can spend tokens`, async function () {
            await setApprovalForAll(accessPass, receiver, await endpoint.getAddress(), true)
            await expect(accessPass.connect(endpoint).transferFrom(receiverAddress, await admin.getAddress(), tokenIds[0])).not.to.be.reverted
        })
    })

    describe("isApprovedForAll(address, address)", async function () {
        it("Proxy is approved for all", async function () {
            const isApproved = await accessPass.isApprovedForAll(await admin.getAddress(), await proxy.getAddress())
            expect(isApproved).to.be.equal(true);
        });

        it("Non-approval wallet is not approved for all", async function () {
            
            const isApproved = await accessPass.isApprovedForAll(
                await admin.getAddress(),
                await nonApproval.getAddress()
            )
            expect(isApproved).to.be.equal(false);
        });
    });

    describe(`transferFrom(address, address, uint256)`, async function () {

        let tokenIds : Array<Number>
        this.beforeEach(async function () {
            tokenIds = [1,2,3,4,5,6]
            await mint(accessPass, endpoint, receiverAddress, tokenIds);
        })

        it(`Should emit Transfer event`, async function () {
            const receipt = await transferFrom(accessPass, receiver, receiverAddress, await admin.getAddress(), tokenIds[0])

            const iface = new ethers.Interface([
                `event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`,
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log)
                if (mLog && mLog.name === `Transfer`) {
                    const {from, to, tokenId} = mLog.args
                    expect(from).to.be.equal(receiverAddress)
                    expect(to).to.be.equal(await admin.getAddress())
                    expect(tokenId).to.be.equal(tokenIds[0])
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Should fail with non-existent tokenId`, async function () {
            await expect(accessPass.connect(receiver).transferFrom(await receiver.getAddress(), await admin.getAddress(), 7)).to.be.revertedWithCustomError(accessPass, 'ERC721InvalidSender')
        })

        it(`Should not allow any proxy to mint tokens`, async function () {
            await expect(accessPass.connect(proxy).transferFrom(ZeroAddress, await receiver.getAddress(), 7)).to.be.revertedWithCustomError(accessPass, 'ERC721InvalidSender')
        })

        it(`A non-approved account cannot execute`, async function () {
            await expect(accessPass.connect(endpoint).transferFrom(receiverAddress, await admin.getAddress(), tokenIds[0])).to.be.revertedWithCustomError(accessPass,"ERC721InsufficientApproval")
        })
    })

    describe("lock(uint256)", async function () {
        let tokenIds : Array<Number>
        this.beforeEach(async function () {
            tokenIds = [1,2,3,4,5,6]
            await grantRole(accessPass, admin, "OPERATOR_ROLE", await operator.getAddress());
            await accessPass.connect(operator).mint(await receiver.getAddress(), tokenIds);
        })

        it(`Operator can execute`, async function () {
            await expect(accessPass.connect(operator).lock(tokenIds[0])).not.to.be.reverted
        })

        it(`Non-operator can not execute`, async function () {
            await expect(accessPass.connect(receiver).lock(tokenIds[0])).to.be.revertedWithCustomError(accessPass, 'AccessControlUnauthorizedAccount')
        })

        it(`Should fail when already locked`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(accessPass.connect(operator).lock(tokenIds[0])).to.be.revertedWithoutReason
        })

        it(`Should fail with non-existent token`, async function () {
            const tokenId = 7
            await expect(accessPass.connect(operator).lock(tokenId)).to.be.revertedWithCustomError(accessPass, 'ERC721NonexistentToken')
        })

        it(`Should fail to transfer the locked token`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(accessPass.connect(receiver).transferFrom(await receiver.getAddress(), await operator.getAddress(), tokenIds[0])).to.be.revertedWithoutReason
        })

        it(`Should fail to burn the locked token`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(accessPass.connect(receiver).burn(tokenIds[0])).to.be.revertedWithoutReason

            await grantRole(accessPass, admin, "PROXY_ROLE", await proxy.getAddress());
            await expect(accessPass.connect(proxy).burn(tokenIds[0])).to.be.revertedWithoutReason
        })

        it(`Token owner can transfer his nft before it is locked, but since the nft is locked, it can not be transferred anymore`, async function () {
            // Transfer nft from Receiver to Operator
            await expect(transferFrom(accessPass, receiver, await receiver.getAddress(), await operator.getAddress(), tokenIds[0])).not.to.be.reverted

            await lock(accessPass, operator, tokenIds[0])

            // Transfer tokenIds[0] from Operator to Receiver
            await expect(transferFrom(accessPass, operator, await operator.getAddress(), await receiver.getAddress(), tokenIds[0])).to.be.revertedWithoutReason
        })

        it(`Should emit a Lock event`, async function () {
            const receipt = await lock(accessPass, operator, tokenIds[0])
            const iface = new ethers.Interface(['event Lock(uint256 indexed id)'])

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log)
                if(mLog && mLog.name === `Lock`) {
                    const {id} = mLog.args
                    expect(id).to.be.equal(tokenIds[0])
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Should update locking status`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            const hasLocked = await isLocked(accessPass, operator, tokenIds[0])
            expect(hasLocked).to.be.equal(true)
        })
    })

    describe(`unlock(uint256)`, async function () {
        let tokenIds : Array<Number>
        this.beforeEach(async function () {
            tokenIds = [1,2,3,4,5,6];
            await grantRole(accessPass, admin, "OPERATOR_ROLE", await operator.getAddress())
            await accessPass.connect(operator).mint(await receiver.getAddress(), tokenIds);
        })
        
        it(`Operator can execute`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(accessPass.connect(operator).unlock(tokenIds[0])).not.to.be.reverted
        }) 

        it(`Non-operator can not execute`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(accessPass.connect(receiver).unlock(tokenIds[0])).to.be.revertedWithCustomError(accessPass, 'AccessControlUnauthorizedAccount')
        })

        it(`Should fail when already unlocked`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await unlock(accessPass, operator, tokenIds[0])

            await expect(accessPass.connect(operator).unlock(tokenIds[0])).to.be.revertedWithoutReason
        })

        it(`Should fail when not get locked`, async function () {
            await expect(accessPass.connect(operator).unlock(tokenIds[0])).to.be.revertedWithoutReason
        }) 

        it(`Should fail with non-existent token`, async function () {
            const tokenId = 7
            await expect(accessPass.connect(operator).unlock(tokenId)).to.be.revertedWithCustomError(accessPass, 'ERC721NonexistentToken')
            
        })

        it(`Should be able to transfer the unlocked token`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(transferFrom(accessPass, receiver, await receiver.getAddress(), await operator.getAddress(), tokenIds[0])).to.be.revertedWithoutReason

            await unlock(accessPass, operator, tokenIds[0])
            const receipt = await transferFrom(accessPass, receiver, await receiver.getAddress(), await operator.getAddress(), tokenIds[0])
            const iface = new ethers.Interface([`event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`])
            var hasEvent = false
            for (const log of receipt.logs ) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const {from, to, tokenId} = mLog.args
                    expect(from).to.be.equal(await receiver.getAddress())
                    expect(to).to.be.equal(await operator.getAddress())
                    expect(tokenId).to.be.equal(tokenIds[0])
                    hasEvent = true
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Should be able to burn the unlocked token`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await expect(accessPass.connect(receiver).burn(tokenIds[0])).to.be.revertedWithoutReason

            await unlock(accessPass, operator, tokenIds[0])
            const receipt = await (await accessPass.connect(receiver).burn(tokenIds[0])).wait();
            const iface = new ethers.Interface([`event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`])
            var hasEvent = false
            for (const log of receipt.logs ) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const {from, to, tokenId} = mLog.args
                    expect(from).to.be.equal(await receiver.getAddress())
                    expect(to).to.be.equal(ZeroAddress)
                    expect(tokenId).to.be.equal(tokenIds[0])
                    hasEvent = true
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Should emit an Unlock event`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            const receipt = await unlock(accessPass, operator, tokenIds[0])

            const iface = new ethers.Interface(['event Unlock(uint256 indexed id)'])
            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log)
                if(mLog && mLog.name === `Unlock`) {
                    const {id} = mLog.args
                    expect(id).to.be.equal(tokenIds[0])
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Should update locking status`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await unlock(accessPass, operator, tokenIds[0])
            const hasLocked = await isLocked(accessPass, operator, tokenIds[0])
            expect(hasLocked).to.be.equal(false)
        })
    })

    describe(`isLocked(uint256)`, async function () {
        let tokenIds : Array<Number>
        this.beforeEach(async function () {
            tokenIds = [1,2,3,4,5,6];
            await grantRole(accessPass, admin, "OPERATOR_ROLE", await operator.getAddress())
            await accessPass.connect(operator).mint(await receiver.getAddress(), tokenIds);
        })

        it(`Should revert with non-existent token`, async function () {
            const tokenId = 7
            await expect(accessPass.connect(operator).isLocked(tokenId)).to.be.revertedWithCustomError(accessPass, 'ERC721NonexistentToken')
        })

        it(`Should return true with already locked token`, async function() {
            await lock(accessPass, operator, tokenIds[0])
            const hasLock = await isLocked(accessPass, operator, tokenIds[0])
            expect(hasLock).to.be.equal(true)
        })

        it(`Should return false with already unlocked token`, async function () {
            await lock(accessPass, operator, tokenIds[0])
            await unlock(accessPass, operator, tokenIds[0])
            const hasLock = await isLocked(accessPass, operator, tokenIds[0])
            expect(hasLock).to.be.equal(false)
        })

        it(`Should return false with every nfts which is never get locked`, async function () {
            const hasLock = await isLocked(accessPass, operator, tokenIds[0])
            expect(hasLock).to.be.equal(false)
        })
    })

    async function setApprovalForAll(contract : Contract, signer : Signer, operator : string, approved : boolean) {
        const tx = await contract.connect(signer).setApprovalForAll(operator, approved)
        const receipt = await tx.wait()
        return receipt
    }

    async function mint(contract : Contract, signer : Signer, to : string, tokenIds : Array<Number>) {
        const tx = await contract.connect(signer).mint(to, tokenIds)
        const receipt = await tx.wait()
        return receipt;
    }

    async function transferFrom(contract : Contract, signer: Signer, from : string, to : string, tokenId : Number) {
        const tx = await contract.connect(signer).transferFrom(from, to, tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    async function grantRole(contract: Contract, signer: Signer, role : string, account: string) {
        var tx, receipt;
        if (role === `OPERATOR_ROLE`) {
            tx = await contract.connect(signer).grantRole(opRole, account);
            receipt = await tx.wait()
    
        } else if (role === `PROXY_ROLE`){
            tx = await contract.connect(signer).grantRole(proxyRole, account);
            receipt = await tx.wait()
        } else {
            throw new Error(`INVALID ROLE ${role}`)
        }
        return receipt;
    }

    async function lock(contract: Contract, signer : Signer, tokenId: Number) {
        const tx = await contract.connect(signer).lock(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    async function unlock(contract: Contract, signer : Signer, tokenId: Number) {
        const tx = await contract.connect(signer).unlock(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    async function isLocked(contract: Contract, signer: Signer, tokenId: Number) {
        const isLocked = await contract.connect(signer).isLocked(tokenId);
        return isLocked;
    }
});
