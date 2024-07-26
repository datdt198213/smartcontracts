import { expect } from "chai";
import { Contract, Signer, ZeroAddress } from "ethers";
import hre from "hardhat";
import { MidnightSociety__factory, VestingWalletFactory__factory } from "../../typechain-types";

describe("MidnightSociety", function () {
    let midnightSocietyContract : MidnightSociety__factory, vestingWalletFactoryContract : VestingWalletFactory__factory;
    let owner : Signer,
        operator : Signer,
        nonOperator : Signer,
        beneficiary : Signer,
        gateway : Signer,
        router : Signer,
        receiver : Signer,
        spender : Signer;
    let decimals: BigInt;
    let midnightSociety : Contract, vestingWalletFactory : Contract;

    beforeEach(async () => {
        [owner, operator, nonOperator, beneficiary, gateway, router, receiver, spender] =
            await hre.ethers.getSigners();

        midnightSocietyContract = await hre.ethers.getContractFactory(
            "MidnightSociety"
        );
        vestingWalletFactoryContract = await hre.ethers.getContractFactory(
            `VestingWalletFactory`
        );

        midnightSociety = await hre.upgrades.deployProxy(
            midnightSocietyContract,
            [[await operator.getAddress()], await gateway.getAddress(), await router.getAddress()],
            { initializer: "initialize", kind: "uups" }
        );
        vestingWalletFactory = await hre.upgrades.deployProxy(
            vestingWalletFactoryContract,
            [await midnightSociety.getAddress()],
            { initializer: "initialize", kind: "uups" }
        );
        await midnightSociety
            .connect(owner)
            .setVaultFactory(await vestingWalletFactory.getAddress());

        decimals = await midnightSociety.decimals();
    });

    describe(`Checking initial values`, async function () {
        it(`Owner has a DEFAULT_ADMIN_ROLE role`, async function () {
            const DEFAULT_ADMIN_ROLE =
                await midnightSociety.DEFAULT_ADMIN_ROLE();
                const hasAdminRole = await midnightSociety.hasRole(
                    DEFAULT_ADMIN_ROLE,
                    await owner.getAddress())
                expect(hasAdminRole).to.be.equal(true);
        });

        it(`Operators has a OPERATOR_ROLE role`, async function () {
            const OPERATOR_ROLE = await midnightSociety.OPERATOR_ROLE();
            const hasOperatorRole = await midnightSociety.hasRole(OPERATOR_ROLE, operator)
                await expect(hasOperatorRole).to.be.equal(true);
        });

        it(`Should initialize gateway correctly`, async function () {
            const gw = await midnightSociety.gateway();
            expect(gw).to.equal(await gateway.getAddress());
        });

        it(`Should initialize router correctly`, async function () {
            const rt = await midnightSociety.router();
            expect(rt).to.equal(await router.getAddress());
        });
    });

    describe(`setVaultFactory(address)`, async function () {
        it(`Only owner can set`, async function () {
            await expect(
                midnightSociety
                    .connect(owner)
                    .setVaultFactory(await vestingWalletFactory.getAddress())
            ).not.to.be.reverted;
        });

        it(`Non-owner can not set`, async function () {
            await expect(
                midnightSociety
                    .connect(nonOperator)
                    .setVaultFactory(await vestingWalletFactory.getAddress())
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `OwnableUnauthorizedAccount`
            );
        });
    });

    describe(`mint(address, amount)`, async function () {
        var amount : BigInt;
        beforeEach(async function () {
            amount = BigInt(20) * BigInt(10) ** decimals;
        });

        it(`Only operator role can mint`, async function () {
            await expect(
                midnightSociety
                    .connect(operator)
                    .mint(await receiver.getAddress(), amount)
            ).not.to.be.reverted;
        });

        it(`Non-operator role can not mint`, async function () {
            await expect(
                midnightSociety
                    .connect(nonOperator)
                    .mint(await receiver.getAddress(), amount)
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `AccessControlUnauthorizedAccount`
            );
        });

        it("Successfully minting tokens should emit Transfer event", async function () {
            const tx = await midnightSociety
                .connect(operator)
                .mint(await receiver.getAddress(), amount);
            const receipt = await tx.wait();
            const iface = new hre.ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, value } = mLog.args;
                    expect(from).to.be.equal(ZeroAddress);
                    expect(to).to.be.equal(await receiver.getAddress());
                    expect(value).to.be.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it(`Should fail to mint token when the receiver is zero address`, async function () {
            await expect(
                midnightSociety.connect(operator).mint(ZeroAddress, 20)
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `ERC20InvalidReceiver`
            );
        });

        it(`Should fail to mint tokens exceeding the cap`, async function () {
            const amountCap = (await midnightSociety.cap()) - BigInt(1);
            await midnightSociety
                .connect(operator)
                .mint(await receiver.getAddress(), amountCap);

            await expect(
                midnightSociety
                    .connect(operator)
                    .mint(await receiver.getAddress(), amount)
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `ERC20ExceededCap`
            );
        });
    });

    describe(`mintLockup(address, uint64, uint64, address, bool, uint256)`, async function () {
        let start, cliff, duration, revocable, amount;
        beforeEach(async function () {
            start = 1718688630;
            cliff = 300;
            duration = 80000;
            revocable = true;
            amount = BigInt(20) * BigInt(10) ** decimals;
        });

        it(`Only operator can mint lockup`, async function () {
            await expect(
                midnightSociety
                    .connect(operator)
                    .mintLockup(
                        await beneficiary.getAddress(),
                        start,
                        cliff,
                        duration,
                        await operator.getAddress(),
                        revocable,
                        amount
                    )
            ).not.to.be.reverted;
        });

        it(`Non-operator can not mint lockup`, async function () {
            await expect(
                midnightSociety
                    .connect(nonOperator)
                    .mintLockup(
                        await beneficiary.getAddress(),
                        start,
                        cliff,
                        duration,
                        await operator.getAddress(),
                        revocable,
                        amount
                    )
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `AccessControlUnauthorizedAccount`
            );
        });

        it(`Successfully mint lockup should emit MintLockUp event`, async function () {
            const tx = await midnightSociety
                .connect(operator)
                .mintLockup(
                    await beneficiary.getAddress(),
                    start,
                    cliff,
                    duration,
                    await operator.getAddress(),
                    revocable,
                    amount
                );

            const receipt = await tx.wait();
            let vaultProxy;

            const upgradedEvent = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "Upgraded"
            );
            vaultProxy = upgradedEvent.address;

            const iface = new hre.ethers.Interface([
                "event MintLockUp(address indexed vaultAddress, address indexed beneficiary, uint64 start, uint64 cliff, uint64 duration, address operator, bool revocable, uint256 amount)",
            ]);

            var hasEvent = false;

            for (let event of receipt.logs) {
                const mLog = iface.parseLog({
                    topics: event.topics,
                    data: event.data,
                });

                if (mLog && mLog.name === `MintLockUp`) {
                    expect(mLog.args[0]).to.equal(vaultProxy);
                    expect(mLog.args[1]).to.equal(
                        await beneficiary.getAddress()
                    );
                    expect(mLog.args[2]).to.equal(BigInt(start));
                    expect(mLog.args[3]).to.equal(BigInt(cliff));
                    expect(mLog.args[4]).to.equal(BigInt(duration));
                    expect(mLog.args[5]).to.equal(await operator.getAddress());
                    expect(mLog.args[6]).to.equal(revocable);
                    expect(mLog.args[7]).to.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });
    });

    describe(`burn(address, amount)`, async function () {
        var amount;

        beforeEach(async function () {
            amount = BigInt(20) * BigInt(10) ** decimals;
        });

        it(`Only operator role can burn`, async function () {
            await midnightSociety
                .connect(operator)
                .mint(await receiver.getAddress(), amount);
            await expect(
                midnightSociety
                    .connect(operator)
                    .burn(await receiver.getAddress(), amount)
            ).not.to.be.reverted;
        });

        it(`Non-operator role can not burn`, async function () {
            await expect(
                midnightSociety
                    .connect(nonOperator)
                    .burn(await receiver.getAddress(), amount)
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `AccessControlUnauthorizedAccount`
            );
        });

        it(`Operator burn token successfully and emitting Transfer event!`, async function () {
            await midnightSociety
                .connect(operator)
                .mint(await receiver.getAddress(), amount);

            const tx = await midnightSociety
                .connect(operator)
                .burn(await receiver.getAddress(), amount);
            const receipt = await tx.wait();

            const iface = new hre.ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);
            var hasEvent = false;

            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog.name === `Transfer`) {
                    expect(mLog.args[0]).to.be.equal(
                        await receiver.getAddress()
                    );
                    expect(mLog.args[1]).to.be.equal(ZeroAddress);
                    expect(mLog.args[2]).to.be.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });
    });

    describe(`pause()`, async function () {
        it(`Only owner can pause`, async function () {
            await expect(midnightSociety.connect(owner).pause()).not.to.be
                .reverted;
        });

        it(`Non-owner can not pause`, async function () {
            await expect(
                midnightSociety.connect(nonOperator).pause()
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `OwnableUnauthorizedAccount`
            );
        });

        it(`Should pause can not mint token`, async function () {
            const amount : BigInt = BigInt(20) * BigInt(10) ** decimals;
            await midnightSociety.connect(owner).pause();
            await expect(
                midnightSociety
                    .connect(operator)
                    .mint(await receiver.getAddress(), amount)
            ).to.be.revertedWithCustomError(midnightSociety, `EnforcedPause`);
        });

        it(`Should fail to transfer`, async function () {
            const amount : BigInt = BigInt(20) * BigInt(10) ** decimals;
            await midnightSociety.connect(operator).mint(await receiver.getAddress(), amount)
            await midnightSociety.connect(owner).pause();

            await expect(midnightSociety.connect(receiver).transfer(await owner.getAddress(), amount)).to.be.revertedWithCustomError(midnightSociety, 'EnforcedPause')
        })

        it(`Should fail to pause when already paused`, async function () {
            await midnightSociety.connect(owner).pause();
            await expect(
                midnightSociety.connect(owner).pause()
            ).to.be.revertedWithCustomError(midnightSociety, `EnforcedPause`);
        });
    });

    describe(`unpause()`, async function () {
        it(`Only owner can unpause`, async function () {
            await midnightSociety.connect(owner).pause();
            await expect(midnightSociety.connect(owner).unpause()).not.to.be
                .reverted;
        });

        it(`Non-owner can not unpause`, async function () {
            await midnightSociety.connect(owner).pause();
            await expect(
                midnightSociety.connect(nonOperator).unpause()
            ).to.be.revertedWithCustomError(
                midnightSociety,
                `OwnableUnauthorizedAccount`
            );
        });

        it(`Should unpause can mint token`, async function () {
            const amount = BigInt(20) * BigInt(10) ** decimals;
            await midnightSociety.connect(owner).pause();
            await midnightSociety.connect(owner).unpause();
            await expect(
                midnightSociety
                    .connect(operator)
                    .mint(await receiver.getAddress(), amount)
            ).not.to.be.reverted;
        });

        it(`Should fail to unpause when already unpaused`, async function () {
            await midnightSociety.connect(owner).pause();
            await midnightSociety.connect(owner).unpause();
            await expect(
                midnightSociety.connect(owner).unpause()
            ).to.be.revertedWithCustomError(midnightSociety, `ExpectedPause`);
        });
    });

    describe(`transfer(address, uint256)`, async function () {
        let amount : BigInt;
        this.beforeEach(async function () {
            amount = BigInt(20) * BigInt(10) ** decimals;
            await midnightSociety.connect(operator).mint(await receiver.getAddress(), amount)
        })

        it(`Should transfer successfully`, async function () {
            await expect(midnightSociety.connect(receiver).transfer(await operator.getAddress(), amount)).not.to.be.reverted
        })

        it(`Should emint Tranfer event`, async function () {
            const receipt = await transfer(midnightSociety, receiver, await operator.getAddress(), amount)
            const iface = new hre.ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log)
                if (mLog && mLog.name === `Transfer`) {
                    const {from, to, value} = mLog.args
                    expect(from).to.be.equal(await receiver.getAddress())
                    expect(to).to.be.equal(await operator.getAddress())
                    expect(value).to.be.equal(amount)
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Not enought balance to transfer`, async function () {
            await transfer(midnightSociety, receiver, await operator.getAddress(), amount)
            await expect(transfer(midnightSociety, receiver, await operator.getAddress(), amount)).to.be.revertedWithCustomError(midnightSociety, 'ERC20InsufficientBalance')
        })
    })

    describe(`approve(address, uint256)`, async function () {
        let amount : BigInt;
        this.beforeEach(async function () {
            amount = BigInt(20) * BigInt(10) ** decimals;
            await midnightSociety.connect(operator).mint(await receiver.getAddress(), amount)
        })

        it(`Should approve successfully and allowance amount equals input amount`, async function () {
            await approve(midnightSociety, operator, await receiver.getAddress(), amount)

            const amountAllowance = await allowance(midnightSociety, operator, await operator.getAddress(), await receiver.getAddress())

            expect(amountAllowance).to.be.equal(amount)
        })

        it('Should emit Approval event', async function () {
            const spenderAddress : string = await spender.getAddress()

            const receipt = await approve(midnightSociety, receiver, spenderAddress, amount)
            const iface = new ethers.Interface(['event Approval(address indexed owner, address indexed spender, uint256 value)'])

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Approval`) {
                    const {owner, spender, value} = mLog.args
                    expect(owner).to.be.equal(await receiver.getAddress())
                    expect(spender).to.be.equal(spenderAddress)
                    expect(value).to.be.equal(amount)
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true)
        })

        it(`Spender can transfer allowance amount by transferFrom`, async function () {
            await approve(midnightSociety, receiver, await spender.getAddress(), amount)

            const receipt = await transferFrom(midnightSociety, spender, await receiver.getAddress(), await operator.getAddress(), amount)

            const iface = new hre.ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const {from, to, value} = mLog.args
                    expect(from).to.be.equal(await receiver.getAddress())
                    expect(to).to.be.equal(await operator.getAddress())
                    expect(value).to.be.equal(amount)
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true)
        })
    })

    async function approve(contract : Contract, signer : Signer, spender : string, value : BigInt ) {
        const tx = await contract.connect(signer).approve(spender, value);
        const receipt = await tx.wait()
        return receipt;
    }

    async function allowance(contract : Contract, signer : Signer, owner : string, spender : string) {
        const amountAllowance = await contract.connect(signer).allowance(owner, spender);
        return amountAllowance;
    }

    async function transfer(contract : Contract, signer : Signer, to : string, value : BigInt) {
        const tx = await contract.connect(signer).transfer(to, value);
        const receipt = await tx.wait();
        return receipt;
    }

    async function transferFrom(contract: Contract, signer : Signer, from : string, to : string, value: BigInt) {
        const tx = await contract.connect(signer).transferFrom(from, to, value);
        const receipt = await tx.wait();
        return receipt;
    }
});
