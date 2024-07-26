import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import hre from "hardhat";
import {
    MidnightSociety__factory,
    VestingWalletCliffUpgradeable__factory,
    VestingWalletFactory__factory,
} from "../../typechain-types";

describe("VestingWalletCliffUpgradeable", function () {
    let owner: Signer,
        operator: Signer,
        nonOperator: Signer,
        beneficiary: Signer,
        gateway: Signer,
        router: Signer;
    let startTimestamp: BigInt,
        cliffSeconds: BigInt,
        durationSeconds: BigInt,
        revocable: boolean;
    let midnightSociety: Contract,
        vestingWalletFactory: Contract,
        vestingWalletCliff: Contract,
        vestingWalletCliffContract: VestingWalletCliffUpgradeable__factory,
        midnightSocietyContract: MidnightSociety__factory,
        vestingWalletFactoryContract: VestingWalletFactory__factory,
        amount: BigInt,
        vaultAddress: string;

    beforeEach(async () => {
        [owner, operator, nonOperator, beneficiary, gateway, router] =
            await hre.ethers.getSigners();

        vestingWalletCliffContract = await hre.ethers.getContractFactory(
            "VestingWalletCliffUpgradeable"
        );

        startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()))
        cliffSeconds = 400n;
        durationSeconds = 4000n;
        revocable = true;
    });

    describe(`Deploy contract`, async function () {

        this.beforeEach(async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()))
            revocable = true
        })

        it(`Can not deploy if cliff > duration`, async function () {
            cliffSeconds = 120n; // 2 minute
            durationSeconds = 60n; // 1 minute

            await expect(
                hre.upgrades.deployProxy(
                    vestingWalletCliffContract,
                    [
                        await beneficiary.getAddress(),
                        startTimestamp,
                        cliffSeconds,
                        durationSeconds,
                        await operator.getAddress(),
                        revocable,
                    ],
                    { initializer: "initialize", kind: "uups" }
                )
            ).to.be.revertedWithCustomError(
                vestingWalletCliffContract,
                `InvalidCliffDuration`
            );
        });

        it(`Can deploy if cliff < duration`, async function () {
            cliffSeconds = 60n; // 1 minute
            durationSeconds = 120n; // 2 minute
            await expect(
                await hre.upgrades.deployProxy(
                    vestingWalletCliffContract,
                    [
                        await beneficiary.getAddress(),
                        startTimestamp,
                        cliffSeconds,
                        durationSeconds,
                        await operator.getAddress(),
                        revocable,
                    ],
                    { initializer: "initialize", kind: "uups" }
                )
            ).not.to.be.reverted;
        });
    });

    async function createVault(
        beneficiary: string,
        startTimestamp: BigInt,
        cliffSeconds: BigInt,
        durationSeconds: BigInt,
        operatorAddress: string,
        revocable: boolean,
        amount: BigInt
    ) {
        const txMidnight = await midnightSociety
            .connect(operator)
            .mintLockup(
                beneficiary,
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                operatorAddress,
                revocable,
                amount
            );

        const iface = new ethers.Interface([
            `event MintLockUp(address indexed vaultAddress, address indexed beneficiary, uint64 start, uint64 cliff, uint64 duration, address operator, bool revocable, uint256 amount)`,
        ]);

        const recept = await txMidnight.wait();
        for (const log of recept.logs) {
            const mLog = iface.parseLog(log);
            if (mLog && mLog.name === `MintLockUp`) vaultAddress = mLog.args[0];
        }

        const vestingWalletCliff: Contract =
            await vestingWalletCliffContract.attach(vaultAddress);

        return vestingWalletCliff;
    }

    describe(`release(address)`, async function () {
        beforeEach(async () => {
            midnightSocietyContract = await hre.ethers.getContractFactory(
                `MidnightSociety`
            );

            midnightSociety = await hre.upgrades.deployProxy(
                midnightSocietyContract,
                [
                    [await operator.getAddress()],
                    await gateway.getAddress(),
                    await router.getAddress(),
                ],
                { initializer: "initialize", kind: "uups" }
            );

            vestingWalletFactoryContract = await hre.ethers.getContractFactory(
                `VestingWalletFactory`
            );

            vestingWalletFactory = await hre.upgrades.deployProxy(
                vestingWalletFactoryContract,
                [await midnightSociety.getAddress()],
                { initializer: "initialize", kind: "uups" }
            );
            await midnightSociety
                .connect(owner)
                .setVaultFactory(await vestingWalletFactory.getAddress());

            amount = 100000n;


        });

        it(`Should receipt 0 tokens if calling before the end of the cliff period`, async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()))       // Current time - 10s
            cliffSeconds = 1200n;     // 1200s
            durationSeconds = 2400n;  // 2400s

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );
            const tx = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const receipt = await tx.wait();

            const ifaceRelease = new ethers.Interface([
                "event ERC20Released(address indexed token, uint256 amount)",
            ]);

            for (const log of receipt.logs) {
                const mLog = ifaceRelease.parseLog(log);

                if (mLog && mLog.name === `ERC20Released`) {
                    const { token, amount } = mLog.args;
                    expect(token).to.be.equal(
                        await midnightSociety.getAddress()
                    );
                    expect(amount).to.be.equal(0);
                }
            }
        });

        it(`Should receive full vault's balance if calling after the vesting period`, async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)       // Current time - 10s
            cliffSeconds = 3n;      // 3s
            durationSeconds = 5n;   // 5s

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );
            const vestedAmount = amount;

            const tx = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const receipt = await tx.wait();

            const ifaceRelease = new ethers.Interface([
                "event ERC20Released(address indexed token, uint256 amount)",
            ]);

            for (const log of receipt.logs) {
                const mLog = ifaceRelease.parseLog(log);

                if (mLog && mLog.name === `ERC20Released`) {
                    const { token, amount } = mLog.args;
                    expect(token).to.be.equal(
                        await midnightSociety.getAddress()
                    );
                    expect(amount).to.be.equal(vestedAmount);
                }
            }
        });

        it(`Should receive a partial amount of vesting tokens at a time between cliff period and the end time`, async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)       // Current time - 10s
            cliffSeconds = 3n;      // 3s
            durationSeconds = 600n;   // 600s
            
            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );
            const tx = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const receipt = await tx.wait();
            console.log();
            const ifaceRelease = new ethers.Interface([
                "event ERC20Released(address indexed token, uint256 amount)",
            ]);

            // Expect ERC20Released event value
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            const timestamp = BigInt(block.timestamp);
            var vestedAmount = (amount * (timestamp - startTimestamp)) /
            durationSeconds;

            for (const log of receipt.logs) {
                const mLog = ifaceRelease.parseLog(log);

                if (mLog && mLog.name === `ERC20Released`) {
                    const { token, amount } = mLog.args;
                    expect(token).to.be.equal(
                        await midnightSociety.getAddress()
                    );
                    expect(amount).to.be.equal(vestedAmount);
                }
            }
        });

        it(`Should emit ERC20Released event`, async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)       // Current time - 10s
            cliffSeconds = 3n;      // 3s
            durationSeconds = 20n;   // 20s

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );
            const tx = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const receipt = await tx.wait();

            const iface = new ethers.Interface([
                "event ERC20Released(address indexed token, uint256 amount)",
            ]);
            var hasEvent = false;

            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `ERC20Released`) {
                    const { token, amount } = mLog.args;
                    expect(token).to.be.equal(
                        await midnightSociety.getAddress()
                    );
                    expect(amount).to.be.equal(amount);
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });

        it(`Should release many times`, async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)       // Current time - 10s
            cliffSeconds = 3n;      // 3s
            durationSeconds = 20n;   // 20s

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            // Call release 5 times
            await expect(vestingWalletCliff.release(await midnightSociety.getAddress())).not.to.be.reverted;
            await expect(vestingWalletCliff.release(await midnightSociety.getAddress())).not.to.be.reverted;
            await expect(vestingWalletCliff.release(await midnightSociety.getAddress())).not.to.be.reverted;
            await expect(vestingWalletCliff.release(await midnightSociety.getAddress())).not.to.be.reverted;
            await expect(vestingWalletCliff.release(await midnightSociety.getAddress())).not.to.be.reverted;
        })
    });

    describe(`revoke(address)`, async function () {
        beforeEach(async () => {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)           // Current time - 10s
            cliffSeconds = 3n;          // 3s
            durationSeconds = 5n;       // 5s
            revocable = true;
            amount = BigInt(1000000);

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );
        });

        it(`Owner can revoke if revocable is true`, async function () {
            await expect(
                vestingWalletCliff
                    .connect(operator)
                    .revoke(await midnightSociety.getAddress())
            ).not.to.be.reverted;
        });

        it(`Non-owner can not revoke`, async function () {
            await expect(
                vestingWalletCliff
                    .connect(nonOperator)
                    .revoke(await midnightSociety.getAddress())
            ).to.be.revertedWithCustomError(
                vestingWalletCliff,
                `OwnableUnauthorizedAccount`
            );
        });

        it(`Owner can not revoke if revocable is false`, async function () {
            revocable = false;
            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            await expect(
                vestingWalletCliff
                    .connect(operator)
                    .revoke(await midnightSociety.getAddress())
            ).to.be.revertedWithoutReason();
        });

        it(`Should fail when already revoked`, async function () {
            await vestingWalletCliff
                .connect(operator)
                .revoke(await midnightSociety.getAddress());

            await expect(
                vestingWalletCliff
                    .connect(operator)
                    .revoke(await midnightSociety.getAddress())
            ).to.be.revertedWithoutReason();
        });

        it(`Should receive all remain balance`, async function () {
            const balance = await midnightSociety.balanceOf(vaultAddress);

            const tx = await vestingWalletCliff
                .connect(operator)
                .revoke(await midnightSociety.getAddress());
            const receipt = await tx.wait();

            const iface = new ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]);
            const ifaceRevoke = new ethers.Interface([
                "event ERC20Revoked(address indexed token)",
            ]);
            var hasEvent = false;

            for (const log of receipt.logs) {
                const mLog = ifaceRevoke.parseLog(log);
                if (mLog && mLog.name === "ERC20Revoked") {
                    const { token } = mLog.args;
                    expect(token).to.be.equal(
                        await midnightSociety.getAddress()
                    );
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);

            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === `Transfer`) {
                    const { from, to, value } = mLog.args;
                    expect(from).to.be.equal(vaultAddress);
                    expect(to).to.be.equal(await operator.getAddress());
                    expect(value).to.be.equal(balance);
                }
            }
        });

        it(`Should fail when the vault remain 0 tokens`, async function () {
            await expect(vestingWalletCliff
                .connect(operator)
                .release(await midnightSociety.getAddress())).not.to.be.reverted;

            await expect(
                vestingWalletCliff
                    .connect(operator)
                    .revoke(await midnightSociety.getAddress())
            ).to.be.revertedWithoutReason;
        });

        it(`Should fail if the duration period has not ended `, async function () {
            cliffSeconds = 3n; // 3 days
            durationSeconds = 60n; // 365 days
            revocable = true;
            amount = BigInt(10000);

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            await expect(
                vestingWalletCliff
                    .connect(operator)
                    .revoke(await midnightSociety.getAddress())
            ).to.be.revertedWithoutReason;
        });

        it(`Should emit ERC20Revoked event`, async function () {
            const tx = await vestingWalletCliff
                .connect(operator)
                .revoke(await midnightSociety.getAddress());

            const receipt = await tx.wait();
            const iface = new ethers.Interface([
                "event ERC20Revoked(address indexed token)",
            ]);
            var hasEvent = false;

            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);
                if (mLog && mLog.name === "ERC20Revoked") {
                    const { token } = mLog.args;
                    expect(token).to.be.equal(
                        await midnightSociety.getAddress()
                    );
                    hasEvent = true;
                }
            }

            expect(hasEvent).to.be.equal(true);
        });
    });

    describe(`releasable(address)`, async function () {

        this.beforeEach(async function () {
            revocable = true;
            amount = BigInt(1000000);
        })

        it("Should return the remain vault's balance after the end of the duration period", async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)           // Current time - 10s
            cliffSeconds = 3n; // 3s
            durationSeconds = 5n; // 5s

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            const releasableAmount = await vestingWalletCliff.releasable(
                await midnightSociety.getAddress()
            );
            expect(releasableAmount).to.be.equal(amount);
        });

        it("Should return 0 if calling before the cliff period", async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()))               // Current time - 20
            cliffSeconds = 1200n;         // 120s
            durationSeconds = 2400n;      // 240s

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            const releasableAmount = await vestingWalletCliff.releasable(
                await midnightSociety.getAddress()
            );
            expect(releasableAmount).to.be.equal(0);
        });

        it("Should return a partial amount of vesting tokens if calling time is between the cliff period and the end time", async function () {
            startTimestamp = BigInt(parseInt(((new Date()).getTime() / 1000).toString()) - 10)           // Current time - 10s
            cliffSeconds = 3n; // 3s
            durationSeconds = 1200n; // 1200 s
            amount = BigInt(1000000);

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            const releasableAmount = await vestingWalletCliff.releasable(
                await midnightSociety.getAddress()
            );

            const blockNumber = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNumber);
            const timestamp = block.timestamp;

            var expectedAmount =
                (amount * (BigInt(timestamp) - startTimestamp)) /
                durationSeconds;

            expect(releasableAmount).to.be.equal(expectedAmount);
        });
    });

    describe(`released(address)`, async function () {
        beforeEach(async () => {});

        it("Should return a total of all released amount", async function () {
            cliffSeconds = 3n; // 3s
            durationSeconds = 120n; // 120s
            amount = BigInt(1000000);

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            const tx = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const tx2 = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const tx3 = await vestingWalletCliff.release(
                await midnightSociety.getAddress()
            );
            const receipt = await tx.wait();
            const receipt2 = await tx2.wait();
            const receipt3 = await tx3.wait();

            const iface = new ethers.Interface([
                "event ERC20Released(address indexed token, uint256 amount)",
            ]);

            var releasedAmount;
            var totalAmount : BigInt = 0n
            for (const log of receipt.logs) {
                const mLog = iface.parseLog(log);

                if (mLog && mLog.name === `ERC20Released`) {
                    releasedAmount = mLog.args[1];
                    totalAmount += releasedAmount
                }
            }
            for (const log of receipt2.logs) {
                const mLog = iface.parseLog(log);

                if (mLog && mLog.name === `ERC20Released`) {
                    releasedAmount = mLog.args[1];
                    totalAmount += releasedAmount
                }
            }
            for (const log of receipt3.logs) {
                const mLog = iface.parseLog(log);

                if (mLog && mLog.name === `ERC20Released`) {
                    releasedAmount = mLog.args[1];
                    totalAmount += releasedAmount;
                }
            }
            const released = await vestingWalletCliff.released(
                await midnightSociety.getAddress()
            );

            expect(released).to.be.equal(totalAmount);
        });

        it("Should return 0 if having 0 success released", async function () {
            cliffSeconds = 3n; // 3s
            durationSeconds = 5n; // 5s
            amount = BigInt(1000000);

            vestingWalletCliff = await createVault(
                await beneficiary.getAddress(),
                startTimestamp,
                cliffSeconds,
                durationSeconds,
                await operator.getAddress(),
                revocable,
                amount
            );

            const released = await vestingWalletCliff.released(
                await midnightSociety.getAddress()
            );

            expect(released).to.be.equal(0);
        });
    });
});
