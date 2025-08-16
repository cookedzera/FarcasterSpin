# 🎰 WheelGame Smart Contract Integration Guide

## 📋 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Arbitrum Sepolia Configuration
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
PRIVATE_KEY=your_private_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key_here

# Contract Addresses (after deployment)
WHEEL_GAME_ADDRESS=0x...
AIDOGE_TOKEN_ADDRESS=0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4
BOOP_TOKEN_ADDRESS=0x0E1CD6557D2BA59C61c75850E674C2AD73253952
BOBOTRUM_TOKEN_ADDRESS=0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19
```

### 2. Installation

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npm install @openzeppelin/contracts

# Initialize Hardhat (if not already done)
npx hardhat init
```

### 3. Deployment

#### Option A: Deploy with Hardhat

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Verify contracts on Arbiscan
npx hardhat verify --network arbitrumSepolia DEPLOYED_CONTRACT_ADDRESS constructor_args...
```

#### Option B: Deploy with Remix IDE

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create new files and paste the contract code
3. Compile with Solidity 0.8.19
4. Connect MetaMask to Arbitrum Sepolia
5. Deploy contracts in this order:
   - Test tokens (if needed)
   - WheelGameArbitrumSepolia with token addresses
6. Fund the game contract with tokens

## 🔗 Frontend Integration (wagmi/viem)

### Contract ABI

```javascript
const WHEEL_GAME_ABI = [
  {
    "inputs": [],
    "name": "spin",
    "outputs": [
      { "name": "segment", "type": "string" },
      { "name": "isWin", "type": "bool" },
      { "name": "tokenAddress", "type": "address" },
      { "name": "rewardAmount", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenAddress", "type": "address" }],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimAllRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "player", "type": "address" }],
    "name": "getPlayerStats",
    "outputs": [
      { "name": "totalSpins", "type": "uint256" },
      { "name": "totalWins", "type": "uint256" },
      { "name": "lastSpinDate", "type": "uint256" },
      { "name": "dailySpins", "type": "uint256" },
      { "name": "spinsRemaining", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "player", "type": "address" }],
    "name": "getPendingRewards",
    "outputs": [
      { "name": "aidoge", "type": "uint256" },
      { "name": "boop", "type": "uint256" },
      { "name": "bobotrum", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWheelSegments",
    "outputs": [{ "name": "", "type": "string[]" }],
    "stateMutability": "pure",
    "type": "function"
  }
];
```

### React Component Example

```jsx
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';

function WheelGame() {
  const [spinResult, setSpinResult] = useState(null);
  
  // Read player stats
  const { data: playerStats } = useContractRead({
    address: WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'getPlayerStats',
    args: [address],
    watch: true
  });
  
  // Read pending rewards
  const { data: pendingRewards } = useContractRead({
    address: WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'getPendingRewards',
    args: [address],
    watch: true
  });
  
  // Spin function
  const { write: spin, data: spinData } = useContractWrite({
    address: WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'spin'
  });
  
  // Wait for spin transaction
  const { isLoading: isSpinning } = useWaitForTransaction({
    hash: spinData?.hash,
    onSuccess(data) {
      // Parse the SpinResult event from logs
      const event = data.logs.