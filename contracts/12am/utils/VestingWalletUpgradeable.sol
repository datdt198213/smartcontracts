// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev A vesting wallet is an ownable contract that can receive ERC-20 tokens, and release these
 * assets to the wallet owner, also referred to as "beneficiary", according to a vesting schedule.
 *
 * Any assets transferred to this contract will follow the vesting schedule as if they were locked from the beginning.
 * Consequently, if the vesting has already started, any amount of tokens sent to this contract will (at least partly)
 * be immediately releasable.
 *
 * By setting the duration to 0, one can configure this contract to behave like an asset timelock that hold tokens for
 * a beneficiary until a specified time.
 *
 * NOTE: When using this contract with any token whose balance is adjusted automatically (i.e. a rebase token), make
 * sure to account the supply/balance adjustment in the vesting schedule to ensure the vested amount is as intended.
 */
abstract contract VestingWalletUpgradeable is Initializable, ContextUpgradeable, OwnableUpgradeable {
    event ERC20Released(address indexed token, uint256 amount);
    event ERC20Revoked(address indexed token);

    /// @custom:storage-location erc7201:openzeppelin.storage.VestingWallet
    struct VestingWalletStorage {
        mapping(address token => uint256) _erc20Released;
        mapping(address token => bool) _erc20Revoked;
        uint64 _start;
        uint64 _duration;
        address _beneficiary;
        bool _revocable;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.VestingWallet")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant VestingWalletStorageLocation = 0xa1eac494560f7591e4da38ed031587f09556afdfc4399dd2e205b935fdfa3900;

    function _getVestingWalletStorage() private pure returns (VestingWalletStorage storage $) {
        assembly {
            $.slot := VestingWalletStorageLocation
        }
    }

    /**
     * @dev Sets the operator as the initial owner, the beneficiary, the start timestamp and the
     * vesting duration of the vesting wallet.
     */
    function __VestingWallet_init(address beneficiary, uint64 startTimestamp, uint64 durationSeconds, address operator, bool revocable) internal onlyInitializing {
        __Ownable_init_unchained(operator);
        __VestingWallet_init_unchained(beneficiary, startTimestamp, durationSeconds, revocable);
    }

    function __VestingWallet_init_unchained(address beneficiary, uint64 startTimestamp, uint64 durationSeconds, bool revocable) internal onlyInitializing {
        VestingWalletStorage storage $ = _getVestingWalletStorage();
        $._beneficiary = beneficiary;
        $._start = startTimestamp;
        $._duration = durationSeconds;
        $._revocable = revocable;
    }

    /**
     * @dev Getter for the start timestamp.
     */
    function start() public view virtual returns (uint256) {
        VestingWalletStorage storage $ = _getVestingWalletStorage();
        return $._start;
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() public view virtual returns (uint256) {
        VestingWalletStorage storage $ = _getVestingWalletStorage();
        return $._duration;
    }

    /**
     * @dev Getter for the end timestamp.
     */
    function end() public view virtual returns (uint256) {
        return start() + duration();
    }

    /**
     * @dev Amount of token already released
     */
    function released(address token) public view virtual returns (uint256) {
        VestingWalletStorage storage $ = _getVestingWalletStorage();
        return $._erc20Released[token];
    }

    /**
     * @dev Getter for the amount of releasable `token` tokens. `token` should be the address of an
     * {IERC20} contract.
     */
    function releasable(address token) public view virtual returns (uint256) {
        return vestedAmount(token, uint64(block.timestamp)) - released(token);
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {ERC20Released} event.
     */
    function release(address token) public virtual {
        VestingWalletStorage storage $ = _getVestingWalletStorage();
        uint256 amount = releasable(token);
        $._erc20Released[token] += amount;
        emit ERC20Released(token, amount);
        SafeERC20.safeTransfer(IERC20(token), $._beneficiary, amount);
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address token, uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(IERC20(token).balanceOf(address(this)) + released(token), timestamp);
    }

    /**
     * @dev Virtual implementation of the vesting formula. This returns the amount vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp >= end()) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start())) / duration();
        }
    }

    /**
     * @dev Allows the operator to revoke the vesting.
     * @param token ERC20 token which is being vested
     */
    function revoke(address token) public onlyOwner {
        VestingWalletStorage storage $ = _getVestingWalletStorage();
        require($._revocable);
        require(!$._erc20Revoked[token]);

        uint256 balance = IERC20(token).balanceOf(address(this));
        bool hasEnded = (uint64(block.timestamp) >= end());
        require(balance > 0 && hasEnded);

        $._erc20Revoked[token] = true;
        SafeERC20.safeTransfer(IERC20(token), owner(), balance);
        emit ERC20Revoked(token);
    }
}
