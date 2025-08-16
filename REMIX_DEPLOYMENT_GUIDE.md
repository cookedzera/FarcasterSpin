# Contract Deployment Guide - Remix IDE

Due to Hardhat/Node.js compatibility issues in this environment, we'll use Remix IDE for contract deployment.

## Contract Information

**Contract:** `WheelGameArbitrumSepoliaComplete.sol` (located in `/contracts/`)
**Network:** Arbitrum Sepolia Testnet
**Chain ID:** 421614

## Token Addresses (Arbitrum Sepolia)

```
AIDOGE: 0x7FD0EEa14bE3FC8f15eE08D44C26c4E3e68EE6f0  
BOOP: 0x9B79F02e60A8d2c7b7f7F96598c7DFd04DDc5f5E
BOBOTRUM: 0x1c6A16aCd4e93ca81b21dC3A09dEe24618d8bD37
```

## Deployment Steps using Remix IDE

### Step 1: Access Remix IDE
1. Go to https://remix.ethereum.org/
2. Accept the terms and close any welcome dialogs

### Step 2: Create New File
1. In the file explorer (left panel), click the + icon to create a new file
2. Name it: `WheelGameArbitrumSepolia.sol`
3. Copy the entire contents of `/contracts/WheelGameArbitrumSepoliaComplete.sol` into this file

### Step 3: Install OpenZeppelin Contracts
1. In the file explorer, right-click in the contracts folder
2. Select "Install" → "npm" → enter: `@openzeppelin/contracts`
3. Wait for installation to complete (you'll see the node_modules folder appear)

### Step 4: Compile Contract
1. Click the Solidity Compiler tab (📝 icon)
2. Set compiler version to `0.8.19+commit.7dd6d404`
3. Enable optimization (runs: 200)
4. Click "Compile WheelGameArbitrumSepolia.sol"
5. Verify successful compilation (green checkmark)

### Step 5: Connect Wallet
1. Click "Deploy & Run Transactions" tab (🚀 icon)
2. Set Environment to "Injected Provider - MetaMask"
3. Your MetaMask should prompt to connect - approve
4. Ensure you're connected to Arbitrum Sepolia network

### Step 6: Deploy Contract
1. In the Deploy section, select `WheelGameArbitrumSepolia` from dropdown
2. Enter constructor parameters:
   ```
   _AIDOGETOKEN: 0x7FD0EEa14bE3FC8f15eE08D44C26c4E3e68EE6f0
   _BOOPTOKEN: 0x9B79F02e60A8d2c7b7f7F96598c7DFd04DDc5f5E  
   _BOBOTRUMTOKEN: 0x1c6A16aCd4e93ca81b21dC3A09dEe24618d8bD37
   ```
3. Click "Deploy" and confirm MetaMask transaction
4. Wait for deployment confirmation

### Step 7: Verify Deployment
1. Copy the deployed contract address from the deployment success message
2. Test basic functions like:
   - `getWheelSegments()` - should return 8 segments
   - `DAILY_SPIN_LIMIT()` - should return 5
   - Contract address should appear on Arbiscan Sepolia

### Step 8: Update Environment Variables
Add the deployed contract address to your project secrets:
```
DEPLOYED_CONTRACT_ADDRESS=0x[your_deployed_address]
```

## Important Notes

- The contract uses existing token addresses from Arbitrum Sepolia
- Daily spin limit is set to 5 spins per player
- Reward amounts: AIDOGE (1 token), BOOP (2 tokens), BOBOTRUM (0.5 tokens)
- BONUS multiplier: 2x, JACKPOT multiplier: 10x
- Contract includes emergency pause functionality and owner controls

## Testing After Deployment

Once deployed, you can test the contract functions directly in Remix:

1. **Read Functions:**
   - `getWheelSegments()` - view all segments
   - `getPlayerStats(address)` - check player statistics  
   - `getPendingRewards(address)` - check pending rewards

2. **Write Functions (for owner):**
   - `depositTokens(address, amount)` - add tokens to contract
   - `setPaused(bool)` - emergency pause

3. **Player Functions:**
   - `spin()` - spin the wheel (up to 5 times per day)
   - `claimRewards(address)` - claim specific token rewards
   - `claimAllRewards()` - claim all pending rewards

## Next Steps

After successful deployment:
1. Update the frontend to use the new contract address
2. Test the spin functionality through the web interface  
3. Verify gas costs are reasonable for users
4. Consider deploying to mainnet when ready

## Troubleshooting

- **Import errors:** Make sure OpenZeppelin contracts are installed in Remix
- **Compilation errors:** Check Solidity version matches (0.8.19)
- **Deployment fails:** Ensure wallet has enough ETH for gas
- **Wrong network:** Verify MetaMask is on Arbitrum Sepolia (Chain ID: 421614)