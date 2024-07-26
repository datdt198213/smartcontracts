// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import "@arbitrum/token-bridge-contracts/contracts/tokenbridge/arbitrum/IArbToken.sol";

contract ChildToken is Initializable, OwnableUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ERC20Upgradeable, IArbToken, UUPSUpgradeable {

    bytes32 public constant PROXY_ROLE = keccak256("PROXY_ROLE");
    string private constant NAME = "$Midnight";
    string private constant SYMBOL = "$1AM";

    address public childGateway;
    address private _l1Address;

    modifier onlyChildGateway() {
        require(msg.sender == childGateway, "NOT_GATEWAY");
        _;
    }

    function initialize(address _childGateway, address _rootTokenAddress, address[] memory _proxies) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        for (uint256 i = 0; i < _proxies.length; i++) {
            require(_proxies[i] != address(0), "Can't add a null address as proxy");
            _grantRole(PROXY_ROLE, _proxies[i]);
        }

        childGateway = _childGateway;
        _l1Address = _rootTokenAddress;

        __Ownable_init(msg.sender);
        __ERC20_init(NAME, SYMBOL);
        __Pausable_init();
    }

    /**
     * @notice should increase token supply by amount, and should only be callable by the childGateway.
     */
    function bridgeMint(address account, uint256 amount) external override onlyChildGateway {
        _mint(account, amount);
    }

    /**
     * @notice should decrease token supply by amount, and should only be callable by the childGateway.
     */
    function bridgeBurn(address account, uint256 amount) external override onlyChildGateway {
        _burn(account, amount);
    }

    function pause() public whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() public whenPaused onlyOwner {
        _unpause();
    }

    function l1Address() public view override returns (address) {
        return _l1Address;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        if (hasRole(PROXY_ROLE, spender)) return type(uint256).max;
        return super.allowance(owner, spender);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual override {
        if (!hasRole(PROXY_ROLE, spender)) {
            super._spendAllowance(owner, spender, value);
        }
    }

    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);

    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {
    }
}
