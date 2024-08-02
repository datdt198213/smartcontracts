// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./interfaces/IERC721Lockable.sol";
import "./utils/URISwitchable.sol";

contract AccessPass is URISwitchable, ERC721, AccessControl, Ownable, IERC721Lockable {  

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PROXY_ROLE = keccak256("PROXY_ROLE");

    bool public frozen = false;
    bool private _proxyApproved;
    mapping(uint256 => bool) private _lockedTokens;

    constructor(string memory name, string memory symbol, address admin, address endpoint, address[] memory proxies)
        Ownable(admin)
        ERC721(name, symbol)
    {
        _proxyApproved = true;

        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        // Grant the endpoint contract the admin role so it will be able to control proxies list
        _grantRole(DEFAULT_ADMIN_ROLE, endpoint);
        // Grant the endpoint contract the operator role so it will be able to mint tokens
        _grantRole(OPERATOR_ROLE, endpoint);
        // Initialize proxies list
        for (uint256 i = 0; i < proxies.length; i++) {
            require(proxies[i] != address(0), "Can't add a null address as proxy");
            _grantRole(PROXY_ROLE, proxies[i]);
        }
    }

    modifier onlyOwnerOrOperator() {
        require(
            hasRole(OPERATOR_ROLE, msg.sender) || msg.sender == owner(),
            "Call by owner or operator only"
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
        require(!frozen);

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

    function mint(address to, uint256[] memory tokenIds)
        external
        onlyOwnerOrOperator
    {
        require(tokenIds.length > 0);

        for(uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(tokenId > 0);
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
        _requireOwned(tokenId);

        return URISwitchable.tokenURI(tokenId);
    }

    function setProxyApproval(bool approval) external onlyOwner {
        _proxyApproved = approval;
    }

    function lock(uint256 id) external virtual override onlyRole(OPERATOR_ROLE) {
        require(!isLocked(id));
        _lockedTokens[id] = true;

        emit Lock(id);
    }

    function unlock(uint256 id) external virtual override onlyRole(OPERATOR_ROLE) {
        require(isLocked(id));
        _lockedTokens[id] = false;

        emit Unlock(id);
    }

    function isLocked(uint256 tokenId) public view virtual override returns (bool) {
        _requireOwned(tokenId);
        return _lockedTokens[tokenId];
    }

    function approve(address to, uint256 tokenId) public virtual override {
        require(!isLocked(tokenId));
        super.approve(to, tokenId);
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

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        if (from == address(0) && auth != address(0)) {
            revert ERC721InvalidSender(address(0));
        }

        if (from != address(0)) {
            require(!isLocked(tokenId));
        }

        return super._update(to, tokenId, auth);
    }
}
