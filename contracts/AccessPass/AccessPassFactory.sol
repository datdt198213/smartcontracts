// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {AccessPass} from "./AccessPass.sol";
import {IAccessPassFactory} from "./interfaces/IAccessPassFactory.sol";

contract AccessPassFactory is Initializable, ContextUpgradeable, OwnableUpgradeable, UUPSUpgradeable, IAccessPassFactory {

    address public endpoint;

    modifier onlyEndpointContract() {
        require(msg.sender == endpoint, "INVALID_SENDER");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _endpoint) public initializer {
        require(_endpoint != address(0));

        __Ownable_init(msg.sender);

        endpoint = _endpoint;
    }

    function create(
        string memory name,
        string memory symbol,
        address admin,
        address[] memory proxies
    ) public onlyEndpointContract override returns (address) {
        AccessPass nftContract = new AccessPass(name, symbol, admin, endpoint, proxies);
        return address(nftContract);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {
    }
}
