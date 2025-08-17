# Remix IDE Deployment Guide for ARBCasino

## Step 1: Open Remix IDE
Go to https://remix.ethereum.org/

## Step 2: Create New Contract
1. Click "Create New File" in File Explorer
2. Name it: `ARBCasinoWheel.sol`

## Step 3: Paste This Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ARBCasinoWheel {
    uint256 public totalSpins;
    mapping(address => uint256) public playerSpins;
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public lastSpinTime;
    
    string[8] private segments = ["AIDOGE", "BUST", "BOOP", "BONUS", "BOBOTRUM", "BUST", "AIDOGE", "JACKPOT"];
    
    // Token addresses
    address constant AIDOGE = 0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4;
    address constant BOOP = 0x0E1CD6557D2BA59C61c75850E674C2AD73253952;
    address constant BOBOTRUM = 0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19;
    
    event SpinResult(
        address indexed player,
        string segment,
        bool isWin,
        address tokenAddress,
        uint256 rewardAmount,
        uint256 randomSeed
    );
    
    constructor() {}
    
    function spin() external returns (string memory segment, bool isWin, address tokenAddress, uint256 rewardAmount) {
        totalSpins++;
        playerSpins[msg.sender]++;
        lastSpinTime[msg.sender] = block.timestamp;
        
        // Generate random number
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            totalSpins,
            blockhash(block.number - 1)
        )));
        
        uint256 segmentIndex = randomSeed % 8;
        segment = segments[segmentIndex];
        
        // Check if win
        isWin = keccak256(abi.encodePacked(segment)) != keccak256(abi.encodePacked("BUST"));
        
        if (isWin) {
            playerWins[msg.sender]++;
        }
        
        // Set rewards
        if (keccak256(abi.encodePacked(segment)) == keccak256(abi.encodePacked("AIDOGE"))) {
            tokenAddress = AIDOGE;
            rewardAmount = 1 ether;
        } else if (keccak256(abi.encodePacked(segment)) == keccak256(abi.encodePacked("BOOP"))) {
            tokenAddress = BOOP;
            rewardAmount = 2 ether;
        } else if (keccak256(abi.encodePacked(segment)) == keccak256(abi.encodePacked("BOBOTRUM"))) {
            tokenAddress = BOBOTRUM;
            rewardAmount = 500000000000000000; // 0.5 ether
        } else if (keccak256(abi.encodePacked(segment)) == keccak256(abi.encodePacked("BONUS"))) {
            tokenAddress = BOOP;
            rewardAmount = 4 ether;
        } else if (keccak256(abi.encodePacked(segment)) == keccak256(abi.encodePacked("JACKPOT"))) {
            tokenAddress = AIDOGE;
            rewardAmount = 10 ether;
        } else {
            tokenAddress = address(0);
            rewardAmount = 0;
        }
        
        emit SpinResult(msg.sender, segment, isWin, tokenAddress, rewardAmount, randomSeed);
        
        return (segment, isWin, tokenAddress, rewardAmount);
    }
    
    function getPlayerStats(address player) external view returns (uint256, uint256, uint256, uint256) {
        return (
            playerSpins[player],
            playerWins[player], 
            lastSpinTime[player],
            0 // dailySpins placeholder
        );
    }
}
```

## Step 4: Compile
1. Go to "Solidity Compiler" tab
2. Select compiler version: 0.8.19+
3. Click "Compile ARBCasinoWheel.sol"
4. Make sure it compiles without errors

## Step 5: Deploy
1. Go to "Deploy & Run Transactions" tab
2. Set Environment to "Injected Provider - MetaMask"
3. Connect your MetaMask wallet
4. Switch MetaMask to Arbitrum Sepolia network:
   - Network name: Arbitrum Sepolia
   - RPC URL: https://sepolia-rollup.arbitrum.io/rpc
   - Chain ID: 421614
   - Currency Symbol: ETH
5. Select "ARBCasinoWheel" contract
6. Click "Deploy"
7. Confirm transaction in MetaMask

## Step 6: Test Contract
1. After deployment, contract will appear in "Deployed Contracts"
2. Expand the contract
3. Click "spin" to test
4. Check "totalSpins" to verify it works

## Step 7: Get Contract Address
1. Copy the deployed contract address (starts with 0x...)
2. Update your DEPLOYED_CONTRACT_ADDRESS secret in Replit with this address

## Step 8: Copy ABI (for developers)
1. Go to "Solidity Compiler" tab
2. Click on "ARBCasinoWheel.sol"
3. Scroll down to find "ABI"
4. Copy the ABI array for frontend integration

## Network Details for MetaMask
- **Network Name:** Arbitrum Sepolia
- **RPC URL:** https://sepolia-rollup.arbitrum.io/rpc  
- **Chain ID:** 421614
- **Currency Symbol:** ETH
- **Block Explorer:** https://sepolia.arbiscan.io/

## Important Notes:
- Make sure you have some ETH on Arbitrum Sepolia for gas fees
- Get testnet ETH from: https://bridge.arbitrum.io/
- The contract address you get should replace the current one: 0x4be6dd3897fd6fbc8a619c69fa6f4bd94531d90a