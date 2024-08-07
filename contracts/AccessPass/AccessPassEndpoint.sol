// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

import {IAccessPass} from "./interfaces/IAccessPass.sol";
import {IAccessPassFactory} from "./interfaces/IAccessPassFactory.sol";
import {IAccessPassEndpoint} from "./interfaces/IAccessPassEndpoint.sol";

contract AccessPassEndpoint is Initializable, ContextUpgradeable, AccessControlUpgradeable, OwnableUpgradeable, UUPSUpgradeable, IAccessPassEndpoint {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    mapping(string => address) internal collections;
    address[] internal collectionsList;
    EnumerableSet.AddressSet internal proxies;
    address internal factory;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address[] memory _operators, address[] memory _proxies) public initializer {
        __Ownable_init(msg.sender);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        for (uint256 i = 0; i < _operators.length; i++) {
            address opIt = _operators[i];
            require(opIt != address(0), "Can't add a null address as operator");
            _grantRole(OPERATOR_ROLE, opIt);
        }

        for (uint256 i = 0; i < _proxies.length; i++) {
            _addProxyToSet(_proxies[i]);
        }
    }

    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0));
        factory = _factory;
    }

    function createCollection(
        string memory name,
        string memory symbol,
        string memory dataPath,
        address admin
    ) external onlyRole(OPERATOR_ROLE) override {
        require(bytes(name).length > 0);
        require(bytes(symbol).length > 0);
        require(bytes(dataPath).length > 0);
        require(admin != address(0));

        if (getCollectionAddress(name) != address(0)) {
            revert CollectionExist(name);
        }

        address nftContract = IAccessPassFactory(factory).create(name, symbol, admin, _getProxies());
        IAccessPass(nftContract).setBaseDisplayURL(dataPath);
        collections[name] = nftContract;
        collectionsList.push(nftContract);
        
        emit CollectionCreated(name, symbol, nftContract);
    }

    function mint(
        string memory name,
        address to,
        uint256[] memory tokenIds
    ) external onlyRole(OPERATOR_ROLE) override {
        address nftContract = getCollectionAddress(name);
        if (nftContract == address(0)) {
            revert NonexistentCollection(name);
        }

        IAccessPass(nftContract).mint(to, tokenIds);
    }

    function mint(
        string memory name,
        address to
    ) external onlyRole(OPERATOR_ROLE) override {
        address nftContract = getCollectionAddress(name);
        if (nftContract == address(0)) {
            revert NonexistentCollection(name);
        }

        uint256 autoIncrementId = IAccessPass(nftContract).maxOwnedTokenId() + 1;
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = autoIncrementId;
        IAccessPass(nftContract).mint(to, tokenIds);
    }

    function getCollectionAddress(string memory name) public view override returns (address) {
        return collections[name];
    }

    function lock(string memory name, uint256 tokenId) external override onlyRole(OPERATOR_ROLE) {
        address nftContract = getCollectionAddress(name);
        if (nftContract == address(0)) {
            revert NonexistentCollection(name);
        }

        IAccessPass(nftContract).lock(tokenId);
    }

    function unlock(string memory name, uint256 tokenId) external override onlyRole(OPERATOR_ROLE) {
        address nftContract = getCollectionAddress(name);
        if (nftContract == address(0)) {
            revert NonexistentCollection(name);
        }

        IAccessPass(nftContract).unlock(tokenId);
    }

    function addProxy(address proxy) public onlyRole(OPERATOR_ROLE) override {
        _addProxyToSet(proxy);

        // Grant PROXY_ROLE to the new proxy in all collections
        for (uint256 i = 0; i < collectionsList.length; i++) {
            address nftContract = collectionsList[i];
            IAccessControl(nftContract).grantRole(IAccessPass(nftContract).PROXY_ROLE(), proxy);
        }
    }

    function removeProxy(address proxy) public onlyRole(OPERATOR_ROLE) override {
        _removeProxyFromSet(proxy);

        // Revoke PROXY_ROLE from this proxy in all collections
        for (uint256 i = 0; i < collectionsList.length; i++) {
            address nftContract = collectionsList[i];
            IAccessControl(nftContract).revokeRole(IAccessPass(nftContract).PROXY_ROLE(), proxy);
        }
    }

    function _addProxyToSet(address proxy) internal {
        require(proxy != address(0), "Can't add a null address as proxy");
        if (!proxies.add(proxy)) {
            revert ProxyExist(proxy);
        }
    }

    function _removeProxyFromSet(address proxy) internal {
        if (!proxies.remove(proxy)) {
            revert NonexistentProxy(proxy);
        }
    }

    function _getProxies() internal view returns (address[] memory) {
        return proxies.values();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {
    }
}
