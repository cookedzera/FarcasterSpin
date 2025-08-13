# Complete Contract Deployment Guide (Beginner-Friendly)

## Step 1: Get Your Wallet Ready 📱

### What You Need:
1. **Arbitrum wallet with ETH** (for gas fees)
2. **Tokens to fund the contract** (AIDOGE, BOOP, BOBOTRUM)

### How to Get ETH on Arbitrum:
- Buy ETH on any exchange (Coinbase, Binance, etc.)
- Bridge ETH to Arbitrum using [Arbitrum Bridge](https://bridge.arbitrum.io/)
- Or buy directly on Arbitrum using on-ramps

## Step 2: Set Up Environment Variables 🔐

We need to add your wallet's private key safely:

1. In Replit, click on "Secrets" in the left sidebar
2. Add these secrets:
   - `WALLET_PRIVATE_KEY`: Your wallet's private key (starts with 0x...)
   - `NEYNAR_API_KEY`: (Optional) For better Farcaster integration

**⚠️ IMPORTANT**: Never share your private key with anyone!

## Step 3: Deploy the Contract 🚀

### Easy Option: Use Remix IDE (Recommended for beginners)

1. **Open Remix**: Go to [remix.ethereum.org](https://remix.ethereum.org)
2. **Import contract**: Copy the content from `contracts/WheelGameImproved.sol`
3. **Compile**: Click "Solidity Compiler" → "Compile"
4. **Connect wallet**: Go to "Deploy & Run" → Select "Injected Provider - MetaMask"
5. **Switch to Arbitrum**: Make sure your wallet is on Arbitrum network
6. **Deploy**: Click "Deploy" button

### Alternative: Use Deployment Script

Run this command in Replit console:
```bash
node deploy-contract.js
```

This will check your setup and guide you through the process.

## Step 4: Fund the Contract 💰

After deployment, you'll need to send tokens to the contract:
- Send AIDOGE tokens for AIDOGE/JACKPOT rewards
- Send BOOP tokens for BOOP/BONUS rewards  
- Send BOBOTRUM tokens for BOBOTRUM rewards

## Step 5: Update the App 🔧

After deploying, run this command with your contract address:
```bash
node update-contract-address.js 0xYourContractAddressHere
```

This automatically updates all the necessary files.

## Step 6: Test Everything ✅

We'll test a few spins to make sure everything works.

---

## Ready to Start?

1. **First**: Get your wallet private key ready
2. **Second**: Make sure you have ETH on Arbitrum for gas fees
3. **Third**: Let me know when you're ready and I'll start the deployment process!

**Estimated time**: 10-15 minutes
**Cost**: ~$5-10 in ETH for gas fees