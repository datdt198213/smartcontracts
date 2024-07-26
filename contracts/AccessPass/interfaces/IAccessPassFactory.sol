// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IAccessPassFactory {
    function create(
        string memory name,
        string memory symbol,
        address admin,
        address[] memory proxies
    ) external returns (address);
}
