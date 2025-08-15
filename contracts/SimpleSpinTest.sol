// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleSpinTest
 * @dev Basic contract for testing spin functionality without restrictions
 */
contract SimpleSpinTest {
    uint256 public totalSpins;
    
    mapping(address => uint256) public playerSpins;
    
    event SpinExecuted(address indexed player, uint256 spinNumber);
    
    function spin() external {
        playerSpins[msg.sender]++;
        totalSpins++;
        
        emit SpinExecuted(msg.sender, playerSpins[msg.sender]);
    }
    
    function getPlayerSpins(address player) external view returns (uint256) {
        return playerSpins[player];
    }
}