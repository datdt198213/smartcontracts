// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC20CappedUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IERC20Bridge } from "@arbitrum/token-bridge-contracts/contracts/tokenbridge/libraries/IERC20Bridge.sol";

import {IL1CustomGateway2} from "./interfaces/IL1CustomGateway2.sol";
import {IL1GatewayRouter2, IInbox} from "./interfaces/IL1GatewayRouter2.sol";
import {IVestingWalletFactory} from "./interfaces/IVestingWalletFactory.sol";

contract MidnightSocietyCustom2 is Initializable, OwnableUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ERC20CappedUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    event MintLockUp(address indexed vaultAddress, address indexed beneficiary, uint64 start, uint64 cliff, uint64 duration, address operator, bool revocable, uint256 amount);

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    uint256 private constant CAP = 3_000_000_000 * 10 ** 18;
    string private constant NAME = "$Midnight";
    string private constant SYMBOL = "$1AM";

    address public gateway;
    address public router;
    address internal vaultFactory;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address[] memory _operators, address _gateway, address _router) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        require(_gateway != address(0) && _router != address(0));
        for (uint256 i = 0; i < _operators.length; i++) {
            require(_operators[i] != address(0), "Can't add a null address as operator");
            _grantRole(OPERATOR_ROLE, _operators[i]);
        }

        gateway = _gateway;
        router = _router;

        __Ownable_init(msg.sender);
        __ERC20_init(NAME, SYMBOL);
        __ERC20Capped_init(CAP);
        __Pausable_init();

    }

    function mint(address wallet, uint256 amount) public onlyRole(OPERATOR_ROLE) {
        require(amount > 0);
        _mint(wallet, amount);
    }

    function burn(address wallet, uint256 amount) public onlyRole(OPERATOR_ROLE) {
        require(amount > 0);
        _burn(wallet, amount);
    }

    function mintLockup(
        address beneficiary,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        address operator,
        bool revocable,
        uint256 amount
    ) public onlyRole(OPERATOR_ROLE) {
        require(beneficiary != address(0) && operator != address(0));
        require(start > 0);
        require(amount > 0);

        address vaultProxy = IVestingWalletFactory(vaultFactory).createVault(beneficiary, start, cliff, duration, operator, revocable);

        _mint(vaultProxy, amount);
        emit MintLockUp(vaultProxy, beneficiary, start, cliff, duration, operator, revocable, amount);
    }

    function pause() public whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() public whenPaused onlyOwner {
        _unpause();
    }

    function setVaultFactory(address _vaultFactory) external onlyOwner {
        require(_vaultFactory != address(0));
        vaultFactory = _vaultFactory;
    }

    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
    
    function depositERC20(uint256 amount) public whenNotPaused returns (uint256) {
        address inbox = IL1GatewayRouter2(router).inbox();
        return IInbox(inbox).depositERC20(amount);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {
    }
}
