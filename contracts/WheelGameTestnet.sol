// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WheelGameTestnet
 * @dev Enhanced testnet version of WheelGame for Arbitrum Sepolia
 * @notice Uses testnet tokens for safe testing with improved security
 */
contract WheelGameTestnet is Ownable, ReentrancyGuard {
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
    
    // Testnet token addresses (immutable for gas efficiency)
    address public immutable IARB = 0x06d8c3f0e1cfb7e9d3f5b51d17dcd623acc1b3b7;  // IntArbTestToken
    address public immutable JUICE = 0x1842887de1c7fdd59e3948a93cd41aad48a19cb2; // TestJuicy
    address public immutable ABET = 0x0ba7a82d415500bebfa254502b655732cd678d07;  // ArbBETestt
    
    // Game configuration (constants for gas efficiency)
    uint256 public constant MAX_DAILY_SPINS = 5;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Wheel segments for randomness
    string[] public wheelSegments = ["IARB", "BUST", "JUICE", "BONUS", "ABET", "BUST", "IARB", "JACKPOT"];
    
    // State variables
    mapping(string => RewardToken) public rewards;
    mapping(address => PlayerStats) public players;
    
    // Nonce for additional randomness entropy
    uint256 private nonce;
    
    // Custom errors (gas efficient)
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
    
    /**
     * @dev Constructor initializes reward tiers with testnet tokens
     */
    constructor() {
        
        // Initialize reward tiers with testnet tokens
        rewards["JACKPOT"] = RewardToken({
            token: IARB,
            rewardAmount: 5 * 10**18, // 5 IARB
            isActive: true
        });
        
        rewards["IARB"] = RewardToken({
            token: IARB,
            rewardAmount: 1 * 10**18, // 1 IARB
            isActive: true
        });
        
        rewards["JUICE"] = RewardToken({
            token: JUICE,
            rewardAmount: 2 * 10**18, // 2 JUICE
            isActive: true
        });
        
        rewards["ABET"] = RewardToken({
            token: ABET,
            rewardAmount: 3 * 10**18, // 3 ABET
            isActive: true
        });
        
        rewards["BONUS"] = RewardToken({
            token: JUICE,
            rewardAmount: 1 * 10**18, // 1 JUICE
            isActive: true
        });
        
        rewards["BUST"] = RewardToken({
            token: address(0),
            rewardAmount: 0,
            isActive: false
        });
    }
    
    /**
     * @dev Spin the wheel to potentially win tokens
     * @notice Players can spin up to MAX_DAILY_SPINS times per day
     */
    function spin() external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        
        // Cache values to reduce storage reads
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 lastSpinDay = player.lastSpinDate / SECONDS_PER_DAY;
        uint256 currentDailySpins = currentDay > lastSpinDay ? 0 : player.dailySpins;
        
        if (currentDailySpins >= MAX_DAILY_SPINS) {
            revert DailySpinLimitReached();
        }
        
        // Generate random number
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            nonce++,
            blockhash(block.number - 1)
        )));
        
        // Determine winning segment
        string memory landedSegment = wheelSegments[randomSeed % wheelSegments.length];
        
        // Update player stats
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
    
    /**
     * @dev Claim pending rewards for a specific token
     * @param tokenAddress Address of the token to claim
     */
    function claimRewards(address tokenAddress) external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        uint256 amount = player.pendingRewards[tokenAddress];
        
        if (amount == 0) {
            revert NoRewardsToClaim();
        }
        
        if (tokenAddress == address(0)) {
            revert InvalidTokenAddress();
        }
        
        // Check contract balance before transfer
        IERC20 token = IERC20(tokenAddress);
        if (token.balanceOf(address(this)) < amount) {
            revert InsufficientContractBalance();
        }
        
        // Clear pending rewards before transfer (CEI pattern)
        player.pendingRewards[tokenAddress] = 0;
        
        // Transfer tokens
        bool success = token.transfer(msg.sender, amount);
        require(success, "Token transfer failed");
        
        emit RewardsClaimed(msg.sender, tokenAddress, amount);
    }
    
    /**
     * @dev Get comprehensive player statistics
     * @param playerAddress Address of the player
     * @return totalSpins Total number of spins by player
     * @return totalWins Total number of wins by player
     * @return lastSpinDate Timestamp of last spin
     * @return dailySpins Number of spins today
     * @return spinsRemaining Number of spins remaining today
     */
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
    
    /**
     * @dev Get pending rewards for all testnet tokens
     * @param playerAddress Address of the player
     * @return iarbRewards Pending IARB tokens
     * @return juiceRewards Pending JUICE tokens  
     * @return abetRewards Pending ABET tokens
     */
    function getPendingRewards(address playerAddress) external view returns (
        uint256 iarbRewards,
        uint256 juiceRewards,
        uint256 abetRewards
    ) {
        PlayerStats storage player = players[playerAddress];
        
        return (
            player.pendingRewards[IARB],
            player.pendingRewards[JUICE],
            player.pendingRewards[ABET]
        );
    }
    
    /**
     * @dev Fund the contract with tokens for rewards (owner only)
     * @param tokenAddress Address of token to fund
     * @param amount Amount of tokens to transfer
     */
    function fundContract(address tokenAddress, uint256 amount) external onlyOwner {
        if (tokenAddress == address(0)) {
            revert InvalidTokenAddress();
        }
        
        IERC20 token = IERC20(tokenAddress);
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        emit ContractFunded(tokenAddress, amount);
    }
    
    /**
     * @dev Get all wheel segments
     * @return Array of wheel segment names
     */
    function getWheelSegments() external view returns (string[] memory) {
        return wheelSegments;
    }
    
    /**
     * @dev Get contract balance for a specific token
     * @param tokenAddress Address of token to check
     * @return Current balance of tokens in contract
     */
    function getContractBalance(address tokenAddress) external view returns (uint256) {
        if (tokenAddress == address(0)) return 0;
        return IERC20(tokenAddress).balanceOf(address(this));
    }
    
    /**
     * @dev Emergency withdraw function (owner only)
     * @param tokenAddress Address of token to withdraw
     */
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

/**
 * @dev IERC20 interface for token interactions
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}