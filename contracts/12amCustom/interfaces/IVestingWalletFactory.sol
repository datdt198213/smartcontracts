// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IVestingWalletFactory {
    function createVault(
        address beneficiary,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        address operator,
        bool revocable
    ) external returns (address);
}
