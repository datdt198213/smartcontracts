// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IL1GatewayRouter2 {
    function setGateway(
        address _gateway,
        uint256 _maxGas,
        uint256 _gasPriceBid,
        uint256 _maxSubmissionCost,
        address _creditBackAddress,
        uint256 _feeAmount
    ) external payable returns (uint256);

    function inbox() external returns (address);
}

interface IInbox {
    function bridge() external view returns (address);
    function depositERC20(uint256) external returns (uint256);
}
