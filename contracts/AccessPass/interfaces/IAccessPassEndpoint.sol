// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IAccessPassEndpoint {
    event CollectionCreated(string indexed name, string indexed symbol, address indexed contractAddress);

    error CollectionExist(string name);

    error NonexistentCollection(string name);

    error ProxyExist(address);

    error NonexistentProxy(address);

    function createCollection(
        string memory name,
        string memory symbol,
        string memory dataPath,
        address admin
    ) external;

    function getCollectionAddress(
        string memory name
    ) external returns (address);

    function mint(
        string memory name,
        address to,
        uint256[] memory tokenIds
    ) external;

    function mint(
        string memory name,
        address to
    ) external;

    function lock(
        string memory name,
        uint256 tokenId
    ) external;

    function unlock(
        string memory name,
        uint256 tokenId
    ) external;

    function addProxy(address proxy, address[] memory collections) external;

    function addToSet(address[] memory proxies) external;

    function removeProxy(address proxy, address[] memory collections) external;

    function removeFromSet(address[] memory proxies) external;
}
