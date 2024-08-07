// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import {VestingWalletCliffUpgradeable} from "./VestingWalletCliffUpgradeable.sol";
import {IVestingWalletFactory} from "../interfaces/IVestingWalletFactory.sol";

contract VestingWalletFactory is Initializable, ContextUpgradeable, OwnableUpgradeable, UUPSUpgradeable, IVestingWalletFactory {

    address public token;
    address public beacon;

    modifier onlyTokenContract() {
        require(msg.sender == token, "INVALID_SENDER");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _token, address _beaconOwner) public initializer {
        require(_token != address(0));

        __Ownable_init(msg.sender);

        token = _token;

        VestingWalletCliffUpgradeable _vaultImpl = new VestingWalletCliffUpgradeable();
        UpgradeableBeacon _beacon = new UpgradeableBeacon(address(_vaultImpl), _beaconOwner);
        beacon = address(_beacon);
    }

    function createVault(
        address beneficiary,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        address operator,
        bool revocable
    ) public onlyTokenContract override returns (address) {
        BeaconProxy vaultProxy = new BeaconProxy(beacon, abi.encodeWithSelector(VestingWalletCliffUpgradeable.initialize.selector, beneficiary, start, cliff, duration, operator, revocable));

        return address(vaultProxy);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {
    }
}
