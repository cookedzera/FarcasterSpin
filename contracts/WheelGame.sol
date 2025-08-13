// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract WheelGame is Ownable, ReentrancyGuard, Pausable {
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
    
    // Token addresses on Arbitrum mainnet
    address public immutable AIDOGE = 0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b;
    address public immutable BOOP = 0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3;
    address public immutable BOBOTRUM = 0x60460971a3D79ef265dfafA393ffBCe97d91E8B8;
    
    // Game configuration
    uint256 public constant MAX_DAILY_SPINS = 5;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Reward tiers
    mapping(string => RewardToken) public rewards;
    mapping(address => PlayerStats) public players;
    
    // Game events
    event SpinResult(
        address indexed player,
        string segment,
        bool isWin,
        address tokenAddress,
        uint256 rewardAmount
    );
    
    event RewardsClaimed(
        address indexed player,
        address indexed token,
        uint256 amount
    );
    
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
    
    function spin(string memory segment) external nonReentrant whenNotPaused {
        PlayerStats storage player = players[msg.sender];
        
        // Check daily spin limit
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 lastSpinDay = player.lastSpinDate / SECONDS_PER_DAY;
        
        if (currentDay > lastSpinDay) {
            player.dailySpins = 0;
        }
        
        require(player.dailySpins < MAX_DAILY_SPINS, "Daily spin limit reached");
        
        // Update player stats
        player.totalSpins++;
        player.dailySpins++;
        player.lastSpinDate = block.timestamp;
        
        RewardToken memory reward = rewards[segment];
        bool isWin = reward.isActive && reward.rewardAmount > 0;
        
        if (isWin) {
            player.totalWins++;
            player.pendingRewards[address(reward.token)] += reward.rewardAmount;
        }
        
        emit SpinResult(
            msg.sender,
            segment,
            isWin,
            address(reward.token),
            reward.rewardAmount
        );
    }
    
    function claimRewards(address tokenAddress) external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        uint256 amount = player.pendingRewards[tokenAddress];
        
        require(amount > 0, "No rewards to claim");
        
        player.pendingRewards[tokenAddress] = 0;
        
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
        
        emit RewardsClaimed(msg.sender, tokenAddress, amount);
    }
    
    function claimAllRewards() external nonReentrant {
        PlayerStats storage player = players[msg.sender];
        
        // Claim AIDOGE
        uint256 aidogeAmount = player.pendingRewards[AIDOGE];
        if (aidogeAmount > 0) {
            player.pendingRewards[AIDOGE] = 0;
            IERC20(AIDOGE).safeTransfer(msg.sender, aidogeAmount);
            emit RewardsClaimed(msg.sender, AIDOGE, aidogeAmount);
        }
        
        // Claim BOOP
        uint256 boopAmount = player.pendingRewards[BOOP];
        if (boopAmount > 0) {
            player.pendingRewards[BOOP] = 0;
            IERC20(BOOP).safeTransfer(msg.sender, boopAmount);
            emit RewardsClaimed(msg.sender, BOOP, boopAmount);
        }
        
        // Claim BOBOTRUM
        uint256 bobotrumAmount = player.pendingRewards[BOBOTRUM];
        if (bobotrumAmount > 0) {
            player.pendingRewards[BOBOTRUM] = 0;
            IERC20(BOBOTRUM).safeTransfer(msg.sender, bobotrumAmount);
            emit RewardsClaimed(msg.sender, BOBOTRUM, bobotrumAmount);
        }
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
    
    // Admin functions
    function updateRewardAmount(string memory segment, uint256 newAmount) external onlyOwner {
        rewards[segment].rewardAmount = newAmount;
        emit RewardUpdated(segment, newAmount);
    }
    
    function emergencyWithdraw(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(owner(), balance);
    }
    
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
}