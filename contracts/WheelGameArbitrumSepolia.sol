// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title WheelGameArbitrumSepolia
 * @dev Arbitrum Sepolia testnet version of WheelGame
 * @notice Uses Arbitrum Sepolia testnet tokens for testing
 */
contract WheelGameArbitrumSepolia is Ownable, ReentrancyGuard {
    struct RewardToken {
        address token;
        uint256 rewardAmount;
        bool isActive;
    }
    
    struct PlayerStats {
        uint256 totalSpins;
        uint256 totalWins;
        uint256 lastSpinDate;
        uint256 dailySpins;
        mapping(address => uint256) pendingRewards;
    }
    
    // Arbitrum Sepolia testnet token addresses
    address public immutable ARB_TOKEN = 0x0000000000000000000000000000000000000001; // Placeholder for ARB
    address public immutable USDC_TOKEN = 0x0000000000000000000000000000000000000002; // Placeholder for USDC
    address public immutable ETH_TOKEN = 0x0000000000000000000000000000000000000003; // Placeholder for WETH
    
    // Game configuration
    uint256 public constant MAX_DAILY_SPINS = 5;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Wheel segments for randomness
    string[] public wheelSegments = ["ARB", "BUST", "USDC", "BONUS", "ETH", "BUST", "ARB", "JACKPOT"];
    
    // State variables
    mapping(string => RewardToken) public rewards;
    mapping(address => PlayerStats) public players;
    
    // Nonce for additional randomness entropy
    uint256 private nonce;
    
    // Custom errors
    error DailySpinLimitReached();
    error NoRewardsToClaim();
    error InvalidTokenAddress();
    error InsufficientContractBalance();
    
    // Events
    event SpinResult(
        address indexed player,
        string segment,
        bool isWin,
        address tokenAddress,
        uint256 rewardAmount,
        uint256 randomSeed
    );
    
    event RewardsClaimed(
        address indexed player,
        address indexed token,
        uint256 amount
    );
    
    event ContractFunded(
        address indexed token,
        uint256 amount
    );
    
    constructor() Ownable(msg.sender) {
        // Initialize reward tiers
        rewards["JACKPOT"] = RewardToken({
            token: ARB_TOKEN,
            rewardAmount: 5 * 10**18, // 5 ARB
            isActive: true
        });
        
        rewards["ARB"] = RewardToken({
            token: ARB_TOKEN,
            rewardAmount: 1 * 10**18, // 1 ARB
            isActive: true
        });
        
        rewards["USDC"] = RewardToken({
            token: USDC_TOKEN,
            rewardAmount: 2 * 10**6, // 2 USDC (6 decimals)
            isActive: true
        });
        
        rewards["ETH"] = RewardToken({
            token: ETH_TOKEN,
            rewardAmount: 1 * 10**15, // 0.001 ETH
            isActive: true
        });
        
        rewards["BONUS"] = RewardToken({
            token: USDC_TOKEN,
            rewardAmount: 1 * 10**6, // 1 USDC
            isActive: true
        });
        
        rewards["BUST"] = RewardToken({
            token: address(0),
            rewardAmount: 0,
            isActive: false
        });
    }
    
    function spin() external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 lastSpinDay = player.lastSpinDate / SECONDS_PER_DAY;
        uint256 currentDailySpins = currentDay > lastSpinDay ? 0 : player.dailySpins;
        
        if (currentDailySpins >= MAX_DAILY_SPINS) {
            revert DailySpinLimitReached();
        }
        
        // Generate random number
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            nonce++,
            blockhash(block.number - 1)
        )));
        
        string memory landedSegment = wheelSegments[randomSeed % wheelSegments.length];
        
        player.totalSpins++;
        player.dailySpins = currentDailySpins + 1;
        player.lastSpinDate = block.timestamp;
        
        RewardToken memory reward = rewards[landedSegment];
        bool isWin = reward.isActive && reward.rewardAmount > 0;
        
        if (isWin) {
            player.totalWins++;
            player.pendingRewards[reward.token] += reward.rewardAmount;
        }
        
        emit SpinResult(
            msg.sender,
            landedSegment,
            isWin,
            reward.token,
            reward.rewardAmount,
            randomSeed
        );
    }
    
    function claimRewards(address tokenAddress) external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        uint256 amount = player.pendingRewards[tokenAddress];
        
        if (amount == 0) {
            revert NoRewardsToClaim();
        }
        
        if (tokenAddress == address(0)) {
            revert InvalidTokenAddress();
        }
        
        IERC20 token = IERC20(tokenAddress);
        if (token.balanceOf(address(this)) < amount) {
            revert InsufficientContractBalance();
        }
        
        player.pendingRewards[tokenAddress] = 0;
        
        bool success = token.transfer(msg.sender, amount);
        require(success, "Token transfer failed");
        
        emit RewardsClaimed(msg.sender, tokenAddress, amount);
    }
    
    function getPlayerStats(address playerAddress) external view returns (
        uint256 totalSpins,
        uint256 totalWins,
        uint256 lastSpinDate,
        uint256 dailySpins,
        uint256 spinsRemaining
    ) {
        PlayerStats storage player = players[playerAddress];
        
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 lastSpinDay = player.lastSpinDate / SECONDS_PER_DAY;
        
        uint256 currentDailySpins = currentDay > lastSpinDay ? 0 : player.dailySpins;
        
        return (
            player.totalSpins,
            player.totalWins,
            player.lastSpinDate,
            currentDailySpins,
            MAX_DAILY_SPINS - currentDailySpins
        );
    }
    
    function getPendingRewards(address playerAddress) external view returns (
        uint256 arbRewards,
        uint256 usdcRewards,
        uint256 ethRewards
    ) {
        PlayerStats storage player = players[playerAddress];
        
        return (
            player.pendingRewards[ARB_TOKEN],
            player.pendingRewards[USDC_TOKEN],
            player.pendingRewards[ETH_TOKEN]
        );
    }
    
    function fundContract(address tokenAddress, uint256 amount) external onlyOwner {
        if (tokenAddress == address(0)) {
            revert InvalidTokenAddress();
        }
        
        IERC20 token = IERC20(tokenAddress);
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        emit ContractFunded(tokenAddress, amount);
    }
    
    function getWheelSegments() external view returns (string[] memory) {
        return wheelSegments;
    }
    
    function getContractBalance(address tokenAddress) external view returns (uint256) {
        if (tokenAddress == address(0)) return 0;
        return IERC20(tokenAddress).balanceOf(address(this));
    }
    
    function emergencyWithdraw(address tokenAddress) external onlyOwner {
        if (tokenAddress == address(0)) {
            revert InvalidTokenAddress();
        }
        
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        bool success = token.transfer(owner(), balance);
        require(success, "Token transfer failed");
    }
}