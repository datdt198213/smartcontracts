import { expect } from "chai";
import { Contract, Signer, ZeroAddress } from "ethers";
import hre from "hardhat";
import { ChildToken__factory } from "../../typechain-types";

describe("ChildToken", function () {
    let childToken: Contract, childTokenContract: ChildToken__factory;
    let owner: Signer,
        proxy: Signer,
        beneficiary: Signer,
        receiver: Signer,
        gateway: Signer,
        spender: Signer,
        nonGateway: Signer,
        rootToken: Signer,
        nonProxy: Signer,
        nonOwner: Signer;
    let amount: BigInt, decimals: BigInt;

    beforeEach(async () => {
        [
            owner,
            proxy,
            beneficiary,
            receiver,
            gateway,
            spender,
            nonGateway,
            rootToken,
            nonProxy,
            nonOwner,
        ] = await hre.ethers.getSigners();

        childTokenContract = await hre.ethers.getContractFactory("ChildToken");

        childToken = await hre.upgrades.deployProxy(
            childTokenContract,
            [
                await gateway.getAddress(),
                await rootToken.getAddress(),
                [await proxy.getAddress()],
            ],
            { initializer: "initialize", kind: "uups" }
        );

        decimals = await childToken.decimals();

        amount = BigInt(10) * BigInt(10) ** decimals;
    });

    describe(`bridgeMint(address, uint256)`, async function () {
        it(`Non-gateway can not mint`, async function () {
            await expect(
                childToken
                    .connect(nonGateway)
                    .bridgeMint(await receiver.getAddress(), amount)
            ).to.be.revertedWith(`NOT_GATEWAY`);
        });

        it(`Only child gateway can mint`, async function () {
            const tx = await childToken
                .connect(gateway)
                .bridgeMint(await receiver.getAddress(), amount);
            const rec = await tx.wait();
            const iface = new ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of rec.logs) {
                const mLog = iface.parseLog(log);
                if (mLog.name === `Transfer`) {
                    const { from, to, value } = mLog.args;
                    expect(from).to.be.equal(ZeroAddress);
                    expect(to).to.be.equal(await receiver.getAddress());
                    expect(value).to.be.equal(amount);
                    hasEvent = true;
                }
            }
            expect(hasEvent).to.be.equal(true);
        });
    });

    describe(`bridgeBurn(address, uint256)`, async function () {
        it(`Non-gateway can not burn`, async function () {
            await expect(
                childToken
                    .connect(nonGateway)
                    .bridgeBurn(await receiver.getAddress(), amount)
            ).to.be.revertedWith(`NOT_GATEWAY`);
        });

        it(`Only child gateway can burn if tokens are already minted`, async function () {
            await childToken
                .connect(gateway)
                .bridgeMint(await receiver.getAddress(), amount);
            const tx = await childToken
                .connect(gateway)
                .bridgeBurn(await receiver.getAddress(), amount);
            const receipt = await tx.wait();
            const iface = new ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, value } = mLog.args;
                    expect(from).to.be.equal(await receiver.getAddress());
                    expect(to).to.be.equal(ZeroAddress);
                    expect(value).to.be.equal(amount);
                    hasEvent = true;
                }
            }
            expect(hasEvent).to.be.equal(true);
        });

        it(`Cannot burn if tokens are not already minted`, async function () {
            await expect(
                childToken
                    .connect(gateway)
                    .bridgeBurn(await receiver.getAddress(), amount)
            ).to.be.revertedWithCustomError(
                childToken,
                `ERC20InsufficientBalance`
            );
        });
    });

    describe(`allowance(address, address)`, async function () {
        it(`Proxy is allowed`, async function () {
            const allowanceAmount = await childToken
                .connect(proxy)
                .allowance(await owner.getAddress(), await proxy.getAddress());
            expect(allowanceAmount).to.be.greaterThan(0);
        });

        it(`Approved wallet is allowed`, async function () {
            await childToken
                .connect(owner)
                .approve(await nonProxy.getAddress(), amount);

            const allowanceAmount = await childToken
                .connect(proxy)
                .allowance(
                    await owner.getAddress(),
                    await nonProxy.getAddress()
                );
            expect(allowanceAmount).to.be.greaterThan(0);
        });

        it(`Non-Approved wallet is not allowed`, async function () {
            const allowanceAmount = await childToken
                .connect(proxy)
                .allowance(
                    await owner.getAddress(),
                    await nonProxy.getAddress()
                );

            expect(allowanceAmount).to.be.equal(0);
        });
    });

    describe(`pause()`, async function () {
        it(`Only owner can pause`, async function () {
            await expect(childToken.connect(owner).pause()).not.to.be.reverted;
        });

        it(`Non-owner can not pause`, async function () {
            await expect(
                childToken.connect(nonOwner).pause()
            ).to.be.revertedWithCustomError(
                childToken,
                `OwnableUnauthorizedAccount`
            );
        });

        it(`Should pause can not mint token`, async function () {
            await childToken.connect(owner).pause();
            await expect(
                childToken
                    .connect(gateway)
                    .bridgeMint(await receiver.getAddress(), 20)
            ).to.be.revertedWithCustomError(childToken, `EnforcedPause`);
        });

        it(`Should fail to pause when already paused`, async function () {
            await childToken.connect(owner).pause();
            await expect(
                childToken.connect(owner).pause()
            ).to.be.revertedWithCustomError(childToken, `EnforcedPause`);
        });

        it(`Should fail to transfer`, async function () {
            const amount: BigInt = BigInt(20) * BigInt(10) ** decimals;
            await bridgeMint(
                childToken,
                gateway,
                await receiver.getAddress(),
                amount
            );
            await childToken.connect(owner).pause();

            await expect(
                childToken
                    .connect(receiver)
                    .transfer(await owner.getAddress(), amount)
            ).to.be.revertedWithCustomError(childToken, "EnforcedPause");
        });
    });

    describe(`unpause()`, async function () {
        it(`Only owner can unpause`, async function () {
            await childToken.connect(owner).pause();
            await expect(childToken.connect(owner).unpause()).not.to.be
                .reverted;
        });

        it(`Non-owner can not unpause`, async function () {
            await childToken.connect(owner).pause();
            await expect(
                childToken.connect(nonOwner).unpause()
            ).to.be.revertedWithCustomError(
                childToken,
                `OwnableUnauthorizedAccount`
            );
        });

        it(`Should unpause can mint token`, async function () {
            await childToken.connect(owner).pause();
            await childToken.connect(owner).unpause();
            await expect(
                childToken
                    .connect(gateway)
                    .bridgeMint(await receiver.getAddress(), amount)
            ).not.to.be.reverted;
        });

        it(`Should unpause can trasfer token`, async function () {
            await childToken.connect(owner).pause();
            await childToken.connect(owner).unpause();
            const amount: BigInt = BigInt(20) * BigInt(10) ** decimals;
            await bridgeMint(
                childToken,
                gateway,
                await receiver.getAddress(),
                amount
            );

            await expect(
                childToken
                    .connect(receiver)
                    .transfer(await owner.getAddress(), amount)
            ).not.to.be.reverted;
        });

        it(`Should fail to unpause when contract already unpaused`, async function () {
            await childToken.connect(owner).pause();
            await childToken.connect(owner).unpause();
            await expect(
                childToken.connect(owner).unpause()
            ).to.be.revertedWithCustomError(childToken, `ExpectedPause`);
        });
    });

    describe(`transfer(address, uint256)`, async function () {
        let amount: BigInt;
        this.beforeEach(async function () {
            amount = BigInt(20) * BigInt(10) ** decimals;
            await childToken
                .connect(gateway)
                .bridgeMint(await receiver.getAddress(), amount);
        });

        it(`Should transfer successfully`, async function () {
            await expect(
                childToken
                    .connect(receiver)
                    .transfer(await gateway.getAddress(), amount)
            ).not.to.be.reverted;
        });

        it(`Should emint Tranfer event`, async function () {
            const receipt = await transfer(
                childToken,
                receiver,
                await gateway.getAddress(),
                amount
            );
            const iface = new hre.ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, value } = mLog.args;
                    expect(from).to.be.equal(await receiver.getAddress());
                    expect(to).to.be.equal(await gateway.getAddress());
                    expect(value).to.be.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it(`Not enought balance to transfer`, async function () {
            await transfer(
                childToken,
                receiver,
                await gateway.getAddress(),
                amount
            );
            await expect(
                transfer(
                    childToken,
                    receiver,
                    await gateway.getAddress(),
                    amount
                )
            ).to.be.revertedWithCustomError(
                childToken,
                "ERC20InsufficientBalance"
            );
        });
    });

    describe(`approve(address, uint256)`, async function () {
        let amount: BigInt;
        this.beforeEach(async function () {
            amount = BigInt(20) * BigInt(10) ** decimals;
            await childToken
                .connect(gateway)
                .bridgeMint(await receiver.getAddress(), amount);
        });

        it(`Should approve successfully and allowance amount equals input amount`, async function () {
            await approve(
                childToken,
                gateway,
                await receiver.getAddress(),
                amount
            );

            const amountAllowance = await allowance(
                childToken,
                gateway,
                await gateway.getAddress(),
                await receiver.getAddress()
            );

            expect(amountAllowance).to.be.equal(amount);
        });

        it("Should emit Approval event", async function () {
            const spenderAddress: string = await spender.getAddress();

            const receipt = await approve(
                childToken,
                receiver,
                spenderAddress,
                amount
            );
            const iface = new ethers.Interface([
                "event Approval(address indexed owner, address indexed spender, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Approval`) {
                    const { owner, spender, value } = mLog.args;
                    expect(owner).to.be.equal(await receiver.getAddress());
                    expect(spender).to.be.equal(spenderAddress);
                    expect(value).to.be.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it(`Spender can transfer allowance amount by transferFrom`, async function () {
            await approve(
                childToken,
                receiver,
                await spender.getAddress(),
                amount
            );

            const receipt = await transferFrom(
                childToken,
                spender,
                await receiver.getAddress(),
                await gateway.getAddress(),
                amount
            );

            const iface = new hre.ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);

            var hasEvent = false;
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, value } = mLog.args;
                    expect(from).to.be.equal(await receiver.getAddress());
                    expect(to).to.be.equal(await gateway.getAddress());
                    expect(value).to.be.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });
    });

    async function bridgeMint(
        contract: Contract,
        signer: Signer,
        account: string,
        amount: BigInt
    ) {
        const tx = await contract.connect(signer).bridgeMint(account, amount);
        const receipt = await tx.wait();
        return receipt;
    }

    async function approve(
        contract: Contract,
        signer: Signer,
        spender: string,
        value: BigInt
    ) {
        const tx = await contract.connect(signer).approve(spender, value);
        const receipt = await tx.wait();
        return receipt;
    }

    async function allowance(
        contract: Contract,
        signer: Signer,
        owner: string,
        spender: string
    ) {
        const amountAllowance = await contract
            .connect(signer)
            .allowance(owner, spender);
        return amountAllowance;
    }

    async function transfer(
        contract: Contract,
        signer: Signer,
        to: string,
        value: BigInt
    ) {
        const tx = await contract.connect(signer).transfer(to, value);
        const receipt = await tx.wait();
        return receipt;
    }

    async function transferFrom(
        contract: Contract,
        signer: Signer,
        from: string,
        to: string,
        value: BigInt
    ) {
        const tx = await contract.connect(signer).transferFrom(from, to, value);
        const receipt = await tx.wait();
        return receipt;
    }
});
