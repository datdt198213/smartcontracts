// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/// @title IERC721Lockable
/// @dev Interface for the Lockable extension

interface IERC721Lockable {

    /**
     * @dev Emitted when `id` token is locked
     */
    event Lock(uint256 indexed id);

    /**
     * @dev Emitted when `id` token is unlocked
     */
    event Unlock(uint256 indexed id);

    /**
     * @dev Locks the `id` token
     */
    function lock(uint256 id) external;

    /**
     * @dev Unlocks the `id` token
     */
    function unlock(uint256 id) external;

    /**
     * @dev Checks whether the token is locked or not
     */
    function isLocked(uint256 tokenId) external view returns (bool);
}
