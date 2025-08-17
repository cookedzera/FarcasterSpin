# ChatGPT Prompt for ARBCasino Wheel Contract

Copy and paste this prompt to ChatGPT to get a working contract:

---

**PROMPT:**

Create a Solidity smart contract for a wheel of fortune game on Arbitrum Sepolia with the following exact requirements:

**Contract Name:** `ARBCasinoWheel`

**Features:**
1. 8 wheel segments: ["AIDOGE", "BUST", "BOOP", "BONUS", "BOBOTRUM", "BUST", "AIDOGE", "JACKPOT"]
2. Token addresses for rewards:
   - AIDOGE: 0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4
   - BOOP: 0x0E1CD6557D2BA59C61c75850E674C2AD73253952
   - BOBOTRUM: 0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19

**Functions needed:**
- `spin()` - returns (string segment, bool isWin, address tokenAddress, uint256 rewardAmount)
- `getPlayerStats(address player)` - returns (uint256 totalSpins, uint256 totalWins, uint256 lastSpinDate, uint256 dailySpins)
- `totalSpins()` - public view returns total spins
- `playerSpins(address)` - mapping for player spin counts

**Events:**
- `SpinResult(address indexed player, string segment, bool isWin, address tokenAddress, uint256 rewardAmount, uint256 randomSeed)`

**Reward amounts:**
- AIDOGE: 1 ether
- BOOP: 2 ether  
- BOBOTRUM: 0.5 ether
- BONUS: 4 ether (2x BOOP)
- JACKPOT: 10 ether (10x AIDOGE)
- BUST: 0 ether

**Requirements:**
- Use Solidity ^0.8.19
- Include proper randomness using block.timestamp, msg.sender, totalSpins, and blockhash
- No external dependencies (no OpenZeppelin imports)
- Simple and minimal - focus on working functionality
- Include constructor that sets up the contract
- Make sure all functions are public/external as needed for frontend integration

**Also provide:**
1. The complete contract code
2. Deployment script using ethers.js v6 for Arbitrum Sepolia RPC: https://sepolia-rollup.arbitrum.io/rpc
3. The ABI array for frontend integration

The contract should be simple, secure, and immediately deployable without compilation issues.

---

**After getting the response from ChatGPT:**
1. Copy the contract code to a new file `contracts/ARBCasinoWheel.sol`
2. Use the deployment script they provide
3. Update the DEPLOYED_CONTRACT_ADDRESS secret with the new address
4. The frontend will automatically connect to the new contract