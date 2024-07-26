// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {VestingWalletCliffUpgradeable} from "./VestingWalletCliffUpgradeable.sol";
import {IVestingWalletFactory} from "../interfaces/IVestingWalletFactory.sol";

contract VestingWalletFactory is Initializable, ContextUpgradeable, OwnableUpgradeable, UUPSUpgradeable, IVestingWalletFactory {

    address public token;

    modifier onlyTokenContract() {
        require(msg.sender == token, "INVALID_SENDER");
        _;
    }

    function initialize(address _token) public initializer {
        __Ownable_init(msg.sender);

        token = _token;
    }

    function createVault(
        address beneficiary,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        address operator,
        bool revocable
    ) public onlyTokenContract override returns (address) {
        VestingWalletCliffUpgradeable vaultImpl = new VestingWalletCliffUpgradeable();
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), abi.encodeWithSelector(VestingWalletCliffUpgradeable.initialize.selector, beneficiary, start, cliff, duration, operator, revocable));
        return address(vaultProxy);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {
    }
}
