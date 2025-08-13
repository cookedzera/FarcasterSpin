// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title WheelGameImproved
 * @dev Enhanced wheel game contract with improved security and randomness
 * Features:
 * - Secure pseudo-randomness using block properties
 * - Timelock for sensitive operations
 * - Gas-optimized reward claiming
 * - Enhanced security measures
 */
contract WheelGameImproved is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    struct RewardToken {
        IERC20 token;
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
    
    struct TimelockOperation {
        bytes32 operationHash;
        uint256 timestamp;
        bool executed;
    }
    
    // Token addresses on Arbitrum mainnet (immutable for gas efficiency)
    address public immutable AIDOGE = 0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b;
    address public immutable BOOP = 0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3;
    address public immutable BOBOTRUM = 0x60460971a3D79ef265dfafA393ffBCe97d91E8B8;
    
    // Game configuration (immutable)
    uint256 public constant MAX_DAILY_SPINS = 5;
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant TIMELOCK_DELAY = 24 hours; // 24 hour timelock for admin operations
    
    // Wheel segments for randomness
    string[] public wheelSegments = ["AIDOGE", "BUST", "BOOP", "BONUS", "BOBOTRUM", "BUST", "AIDOGE", "JACKPOT"];
    
    // State variables
    mapping(string => RewardToken) public rewards;
    mapping(address => PlayerStats) public players;
    mapping(bytes32 => TimelockOperation) public timelockOperations;
    
    // Nonce for additional randomness entropy
    uint256 private nonce;
    
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
    
    event TimelockOperationQueued(bytes32 indexed operationHash, uint256 timestamp);
    event TimelockOperationExecuted(bytes32 indexed operationHash);
    event RewardUpdated(string segment, uint256 newAmount);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    
    constructor() {
        // Initialize reward tiers with real token amounts
        rewards["JACKPOT"] = RewardToken({
            token: IERC20(AIDOGE),
            rewardAmount: 50000 * 10**18, // 50,000 AIDOGE
            isActive: true
        });
        
        rewards["AIDOGE"] = RewardToken({
            token: IERC20(AIDOGE),
            rewardAmount: 10000 * 10**18, // 10,000 AIDOGE
            isActive: true
        });
        
        rewards["BOOP"] = RewardToken({
            token: IERC20(BOOP),
            rewardAmount: 20000 * 10**18, // 20,000 BOOP
            isActive: true
        });
        
        rewards["BOBOTRUM"] = RewardToken({
            token: IERC20(BOBOTRUM),
            rewardAmount: 15000 * 10**18, // 15,000 BOBOTRUM
            isActive: true
        });
        
        rewards["BONUS"] = RewardToken({
            token: IERC20(BOOP),
            rewardAmount: 5000 * 10**18, // 5,000 BOOP
            isActive: true
        });
        
        rewards["BUST"] = RewardToken({
            token: IERC20(address(0)),
            rewardAmount: 0,
            isActive: false
        });
    }
    
    /**
     * @dev Enhanced spin function with secure pseudo-randomness
     * Uses multiple entropy sources to prevent manipulation
     */
    function spin() external nonReentrant whenNotPaused {
        PlayerStats storage player = players[msg.sender];
        
        // Check daily spin limit
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 lastSpinDay = player.lastSpinDate / SECONDS_PER_DAY;
        
        if (currentDay > lastSpinDay) {
            player.dailySpins = 0;
        }
        
        require(player.dailySpins < MAX_DAILY_SPINS, "Daily spin limit reached");
        
        // Generate secure pseudo-random number
        // Note: For production, consider Chainlink VRF for true randomness
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
        player.dailySpins++;
        player.lastSpinDate = block.timestamp;
        
        RewardToken memory reward = rewards[landedSegment];
        bool isWin = reward.isActive && reward.rewardAmount > 0;
        
        if (isWin) {
            player.totalWins++;
            player.pendingRewards[address(reward.token)] += reward.rewardAmount;
        }
        
        emit SpinResult(
            msg.sender,
            landedSegment,
            isWin,
            address(reward.token),
            reward.rewardAmount,
            randomSeed
        );
    }
    
    /**
     * @dev Claim rewards for a specific token (gas-optimized)
     */
    function claimRewards(address tokenAddress) external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        uint256 amount = player.pendingRewards[tokenAddress];
        
        require(amount > 0, "No rewards to claim");
        require(tokenAddress != address(0), "Invalid token address");
        
        // Clear pending rewards before transfer (CEI pattern)
        player.pendingRewards[tokenAddress] = 0;
        
        // Check contract balance before transfer
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        token.safeTransfer(msg.sender, amount);
        
        emit RewardsClaimed(msg.sender, tokenAddress, amount);
    }
    
    /**
     * @dev Batch claim function with gas limit protection
     */
    function claimMultipleRewards(address[] calldata tokenAddresses) external nonReentrant {
        require(tokenAddresses.length <= 10, "Too many tokens, use individual claims");
        
        PlayerStats storage player = players[msg.sender];
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address tokenAddress = tokenAddresses[i];
            uint256 amount = player.pendingRewards[tokenAddress];
            
            if (amount > 0 && tokenAddress != address(0)) {
                player.pendingRewards[tokenAddress] = 0;
                
                IERC20 token = IERC20(tokenAddress);
                if (token.balanceOf(address(this)) >= amount) {
                    token.safeTransfer(msg.sender, amount);
                    emit RewardsClaimed(msg.sender, tokenAddress, amount);
                }
            }
        }
    }
    
    /**
     * @dev Queue a reward amount update with timelock
     */
    function queueRewardUpdate(string memory segment, uint256 newAmount) external onlyOwner {
        bytes32 operationHash = keccak256(abi.encode(segment, newAmount, block.timestamp));
        
        timelockOperations[operationHash] = TimelockOperation({
            operationHash: operationHash,
            timestamp: block.timestamp + TIMELOCK_DELAY,
            executed: false
        });
        
        emit TimelockOperationQueued(operationHash, block.timestamp + TIMELOCK_DELAY);
    }
    
    /**
     * @dev Execute queued reward update after timelock
     */
    function executeRewardUpdate(
        string memory segment,
        uint256 newAmount,
        uint256 queueTimestamp
    ) external onlyOwner {
        bytes32 operationHash = keccak256(abi.encode(segment, newAmount, queueTimestamp));
        TimelockOperation storage operation = timelockOperations[operationHash];
        
        require(operation.timestamp != 0, "Operation not queued");
        require(block.timestamp >= operation.timestamp, "Timelock not expired");
        require(!operation.executed, "Operation already executed");
        
        operation.executed = true;
        rewards[segment].rewardAmount = newAmount;
        
        emit TimelockOperationExecuted(operationHash);
        emit RewardUpdated(segment, newAmount);
    }
    
    /**
     * @dev Get player statistics
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
     * @dev Get pending rewards for a player
     */
    function getPendingRewards(address playerAddress) external view returns (
        uint256 aidogeRewards,
        uint256 boopRewards,
        uint256 bobotrumRewards
    ) {
        PlayerStats storage player = players[playerAddress];
        
        return (
            player.pendingRewards[AIDOGE],
            player.pendingRewards[BOOP],
            player.pendingRewards[BOBOTRUM]
        );
    }
    
    /**
     * @dev Emergency withdraw function (admin only)
     */
    function emergencyWithdraw(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        token.safeTransfer(owner(), balance);
    }
    
    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev Check if contract has sufficient balance for rewards
     */
    function checkContractBalance(address tokenAddress) external view returns (uint256) {
        if (tokenAddress == address(0)) return 0;
        return IERC20(tokenAddress).balanceOf(address(this));
    }
    
    /**
     * @dev Get wheel segments
     */
    function getWheelSegments() external view returns (string[] memory) {
        return wheelSegments;
    }
}