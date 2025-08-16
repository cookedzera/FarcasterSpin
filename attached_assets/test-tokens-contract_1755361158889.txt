// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @notice Base ERC20 test token with faucet and mint functions
 * @dev Used for testing the wheel game on Arbitrum Sepolia
 */
contract TestToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18; // 100 tokens
    uint256 public constant FAUCET_COOLDOWN = 1 days;
    
    mapping(address => uint256) public lastFaucetTime;
    
    event FaucetUsed(address indexed user, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);
    
    error FaucetCooldown(uint256 timeRemaining);
    error InvalidAmount();
    error InvalidAddress();
    
    /**
     * @notice Constructor to create the test token
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial supply to mint to deployer
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @notice Faucet function for users to get free tokens
     * @dev Limited to once per day per address
     */
    function faucet() external {
        uint256 lastTime = lastFaucetTime[msg.sender];
        
        if (lastTime > 0 && block.timestamp < lastTime + FAUCET_COOLDOWN) {
            uint256 timeRemaining = (lastTime + FAUCET_COOLDOWN) - block.timestamp;
            revert FaucetCooldown(timeRemaining);
        }
        
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Mint tokens to a specific address (owner only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Get time remaining until next faucet use
     * @param user Address to check
     * @return timeRemaining Seconds until next faucet use (0 if available)
     */
    function getFaucetCooldown(address user) external view returns (uint256 timeRemaining) {
        uint256 lastTime = lastFaucetTime[user];
        
        if (lastTime == 0 || block.timestamp >= lastTime + FAUCET_COOLDOWN) {
            return 0;
        }
        
        return (lastTime + FAUCET_COOLDOWN) - block.timestamp;
    }
}

/**
 * @title AIDOGETestToken
 * @notice AIDOGE test token for the wheel game
 */
contract AIDOGETestToken is TestToken {
    constructor() TestToken("AIDOGE Test Token", "AIDOGE", 1000000 * 10**18) {}
}

/**
 * @title BOOPTestToken
 * @notice BOOP test token for the wheel game
 */
contract BOOPTestToken is TestToken {
    constructor() TestToken("BOOP Test Token", "BOOP", 1000000 * 10**18) {}
}

/**
 * @title BOBOTRUMTestToken
 * @notice BOBOTRUM test token for the wheel game
 */
contract BOBOTRUMTestToken is TestToken {
    constructor() TestToken("BOBOTRUM Test Token", "BOBOTRUM", 1000000 * 10**18) {}
}