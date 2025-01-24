// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./URISwitchable.sol";

contract TestPass is URISwitchable, ERC721, AccessControl, Ownable {  
    bool public frozen = false;

    bool private _proxyApproved;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PROXY_ROLE = keccak256("PROXY_ROLE");

    constructor(address[] memory operators, bool approveProxy, address[] memory proxies)
        Ownable(_msgSender())
        ERC721("AccessPass", "AccessPass")
    {
        _proxyApproved = approveProxy;

        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        for (uint256 i = 0; i < operators.length; i++) {
            require(operators[i] != address(0), "Can't add a null address as operator");
            _grantRole(OPERATOR_ROLE, operators[i]);
        }

        for (uint256 i = 0; i < proxies.length; i++) {
            require(proxies[i] != address(0), "Can't add a null address as proxy");
            _grantRole(PROXY_ROLE, proxies[i]);
        }
    }

    modifier onlyOwnerOrOperator() {
        require(
            hasRole(OPERATOR_ROLE, msg.sender) || msg.sender == owner(),
            "Function can only be called by owner or operator"
        );
        _;
    }

    function freezeBaseOriginalURI() external onlyOwner
    {
        frozen = true;
    }

    function setBaseOriginalURL(string memory baseURL)
        public
        override
        onlyOwnerOrOperator
    {
        require(!frozen, "Contract is frozen");

        super.setBaseOriginalURL(baseURL);
    }

    function setBaseDisplayURL(string memory baseURL)
        public
        override
        onlyOwnerOrOperator
    {
        super.setBaseDisplayURL(baseURL);
    }

    function switchURL()
        public
        override
        onlyOwnerOrOperator
    {
        super.switchURL();
    }

    function devMint(address to, uint256[] memory tokenIds)
        external
        onlyOwnerOrOperator
    {
        require(tokenIds.length > 0, "Invalid input array");

        for(uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(tokenId > 0, "Token ID must be greater than zero");
            _safeMint(to, tokenId);
        }
    }

    function burn(uint256 tokenId) public {
        require(_isAuthorized(_ownerOf(tokenId), _msgSender(), tokenId), "Caller is not owner nor approved");

        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(URISwitchable, ERC721)
        returns (string memory)
    {
        require(tokenId > 0, "Token ID cannot be 0");
        _requireOwned(tokenId);

        return URISwitchable.tokenURI(tokenId);
    }

    function setProxyApproval(bool approval) external onlyOwner {
        _proxyApproved = approval;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        if (_proxyApproved && hasRole(PROXY_ROLE, operator)) return true;
        return super.isApprovedForAll(owner, operator);
    }
}
