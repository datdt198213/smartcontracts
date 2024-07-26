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
        receiver: Signer,
        proxy: Signer,
        nonApproval: Signer;
    let messageRevertOnlyOwnerOradmin: string;
    const baseURLDisplay = "https://midnight-studio.io/metadata/";
    const baseURLOriginal = "ipfs://abcxyz/";

    beforeEach(async () => {
        [deployer, admin, nonAdmin, endpoint, nonEndpoint, proxy, receiver, nonApproval] =
            await hre.ethers.getSigners();
        name = "Weapon 1";
        symbol = "W1";

        adminAddress = await admin.getAddress();
        receiverAddress = await receiver.getAddress();
        proxyAddress = await proxy.getAddress();

        messageRevertOnlyOwnerOradmin = "Call by owner or operator only";

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
        const OPERATOR_ROLE = await accessPass.OPERATOR_ROLE();
        const DEFAULT_ADMIN_ROLE = await accessPass.DEFAULT_ADMIN_ROLE();

        it("The endpoint should have operator and admin roles", async function () {
            expect(
                await accessPass.connect(owner).hasRole(
                    OPERATOR_ROLE,
                    await endpoint.getAddress()
                )
            ).to.be.equal(true);
            expect(
                await accessPass.connect(owner).hasRole(
                    DEFAULT_ADMIN_ROLE,
                    await endpoint.getAddress()
                )
            ).to.be.equal(true);
        });

        it(`The admin wallet should have Admin role`, async function () {
            expect(
                await accessPass.connect(owner).hasRole(DEFAULT_ADMIN_ROLE, admin)
            ).to.be.equal(true);
        });
    });

    describe("freezeBaseOriginalURI()", async function () {
        it("Owner can freeze", async function () {
            await expect(accessPass.connect(admin).freezeBaseOriginalURI()).not.to.be.reverted;
        });

        it("Non-owner can not freeze", async function () {
            await expect(
                accessPass.connect(nonAdmin).freezeBaseOriginalURI()
            ).to.be.revertedWithCustomError(
                accessPass,
                "OwnableUnauthorizedAccount"
            );
        });

        it("Freezing the base original URI should succeed", async function () {
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
            ).to.be.revertedWith(messageRevertOnlyOwnerOradmin);
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
            ).to.be.revertedWith(`Need a valid URL`);
        });

        it(`Should fail when frozen`, async function () {
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
            ).to.be.revertedWith(messageRevertOnlyOwnerOradmin);
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
            ).to.be.revertedWith(`Need a valid URL`);
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
            await expect(accessPass.connect(proxy).switchURL()).to.be.revertedWith(
                messageRevertOnlyOwnerOradmin
            );
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
            ).to.be.revertedWith(messageRevertOnlyOwnerOradmin);

            await expect(
                accessPass.connect(nonEndpoint).mint(receiverAddress, tokenIds)
            ).to.be.revertedWith(messageRevertOnlyOwnerOradmin);
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
            await expect(accessPass.connect(receiver).transferFrom(await receiver.getAddress(), await admin.getAddress(), 7)).to.be.revertedWithCustomError(accessPass, 'ERC721NonexistentToken')
        })

        it(`A non-approved account cannot execute`, async function () {
            await expect(accessPass.connect(endpoint).transferFrom(receiverAddress, await admin.getAddress(), tokenIds[0])).to.be.revertedWithCustomError(accessPass,"ERC721InsufficientApproval")
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
});
