// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IAccessPass {
    function OPERATOR_ROLE() external returns (bytes32);

    function PROXY_ROLE() external returns (bytes32);

    function setBaseOriginalURL(string memory baseURL) external;

    function setBaseDisplayURL(string memory baseURL) external;

    function mint(address to, uint256[] memory tokenIds) external;

    function lock(uint256 id) external;

    function unlock(uint256 id) external;
}
