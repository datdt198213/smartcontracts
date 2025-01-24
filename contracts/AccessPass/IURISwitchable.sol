// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IURISwitchable {
    function setBaseOriginalURL(string memory baseURL) external;

    function setBaseDisplayURL(string memory baseURL) external;

    function getOriginalURI(uint256 tokenId) external view returns (string memory);

    function getDisplayURI(uint256 tokenId) external view returns (string memory);

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function switchURL() external;
}
