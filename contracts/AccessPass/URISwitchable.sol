// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./IURISwitchable.sol";

abstract contract URISwitchable is IURISwitchable {
    using Strings for uint256;

    bool private _displayMode = true;
    string private _originalBaseURI;
    string private _displayBaseURI;

    function setBaseOriginalURL(string memory baseURL)
        public
        virtual
        override
    {
        require(_hasLength(baseURL), "Need a valid URL");

        _originalBaseURI = baseURL;
    }

    function setBaseDisplayURL(string memory baseURL)
        public
        virtual
        override
    {
        require(_hasLength(baseURL), "Need a valid URL");

        _displayBaseURI = baseURL;
    }

    function switchURL() public virtual override {
        _displayMode = !_displayMode;
    }

    function getOriginalURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _createURI(_originalBaseURI, tokenId);
    }

    function getDisplayURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _createURI(_displayBaseURI, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (_displayMode) {
            return _createURI(_displayBaseURI, tokenId);
        }

        return _createURI(_originalBaseURI, tokenId);
    }

    function _hasLength(string memory str) internal pure returns (bool) {
        return bytes(str).length > 0;
    }

    function _createURI(string memory baseURI, uint256 tokenId)
        internal
        pure
        returns (string memory)
    {
        if (_hasLength(baseURI)) {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        }

        return "";
    }
}
