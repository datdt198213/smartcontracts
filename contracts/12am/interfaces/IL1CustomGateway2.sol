// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IL1CustomGateway2 {
    function registerTokenToL2(
        address _l2Address,
        uint256 _maxGas,
        uint256 _gasPriceBid,
        uint256 _maxSubmissionCost,
        address _creditBackAddress,
        uint256 _feeAmount
    ) external payable returns (uint256);
}
