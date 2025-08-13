// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title WheelGameTestnet
 * @dev Testnet version of WheelGame for Arbitrum Sepolia
 * Uses testnet tokens for safe testing
 */
contract WheelGameTestnet {
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
    
    // Testnet token addresses (your found tokens)
    address public immutable IARB = 0x06d8c3f0e1cfb7e9d3f5b51d17dcd623acc1b3b7;  // IntArbTestToken
    address public immutable JUICE = 0x1842887de1c7fdd59e3948a93cd41aad48a19cb2; // TestJuicy
    address public immutable ABET = 0x0ba7a82d415500bebfa254502b655732cd678d07;  // ArbBETestt
    
    // Game configuration
    uint256 public constant MAX_DAILY_SPINS = 5;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Wheel segments for randomness
    string[] public wheelSegments = ["IARB", "BUST", "JUICE", "BONUS", "ABET", "BUST", "IARB", "JACKPOT"];
    
    // State variables
    mapping(string => RewardToken) public rewards;
    mapping(address => PlayerStats) public players;
    address public owner;
    
    // Nonce for additional randomness
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
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
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
    
    function spin() external {
        PlayerStats storage player = players[msg.sender];
        
        // Check daily spin limit
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 lastSpinDay = player.lastSpinDate / SECONDS_PER_DAY;
        
        if (currentDay > lastSpinDay) {
            player.dailySpins = 0;
        }
        
        require(player.dailySpins < MAX_DAILY_SPINS, "Daily spin limit reached");
        
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
        player.dailySpins++;
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
    
    function claimRewards(address tokenAddress) external {
        PlayerStats storage player = players[msg.sender];
        uint256 amount = player.pendingRewards[tokenAddress];
        
        require(amount > 0, "No rewards to claim");
        require(tokenAddress != address(0), "Invalid token address");
        
        // Clear pending rewards before transfer
        player.pendingRewards[tokenAddress] = 0;
        
        // Transfer tokens (simplified for testnet)
        IERC20(tokenAddress).transfer(msg.sender, amount);
        
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
    
    // Owner functions for funding the contract
    function fundContract(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
    }
    
    function getWheelSegments() external view returns (string[] memory) {
        return wheelSegments;
    }
    
    function getContractBalance(address tokenAddress) external view returns (uint256) {
        if (tokenAddress == address(0)) return 0;
        return IERC20(tokenAddress).balanceOf(address(this));
    }
}

// Simple IERC20 interface for testnet
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}