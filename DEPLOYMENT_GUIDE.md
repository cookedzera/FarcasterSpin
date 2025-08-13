# ArbCasino Smart Contract Deployment Guide

## What We're Building
Your wheel game will connect to real smart contracts on Arbitrum blockchain, giving out actual AIDOGE, BOOP, and BOBOTRUM tokens as rewards.

## Step-by-Step Deployment Process

### Phase 1: Prepare Your Environment

1. **Install Required Tools**
   ```bash
   npm install -g @remix-project/remixd
   npm install hardhat @nomiclabs/hardhat-ethers ethers
   ```

2. **Get Arbitrum ETH for Gas Fees**
   - You need ETH on Arbitrum to deploy contracts
   - Use a bridge like Arbitrum Bridge to move ETH from Ethereum mainnet
   - Minimum needed: ~0.01 ETH for deployment

### Phase 2: Contract Compilation & Deployment

3. **Use Remix IDE (Easiest Method)**
   - Go to https://remix.ethereum.org
   - Create new file: `WheelGame.sol`
   - Copy the contract code from `contracts/WheelGame.sol`
   - Install OpenZeppelin: In Remix, go to File Explorer > .deps > npm > @openzeppelin/contracts
   - Compile: Click "Solidity Compiler" tab, select version 0.8.19+, click "Compile"

4. **Deploy to Arbitrum Mainnet**
   - Click "Deploy & Run Transactions" tab
   - Change Environment to "Injected Provider - MetaMask"
   - Make sure MetaMask is on Arbitrum network (Chain ID: 42161)
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - **SAVE THE CONTRACT ADDRESS** - you'll need this!

### Phase 3: Fund Your Contract

5. **Send Reward Tokens to Contract**
   You need to send tokens to your deployed contract for rewards:
   - **AIDOGE**: Send ~500,000 tokens (for JACKPOT + regular AIDOGE rewards)
   - **BOOP**: Send ~200,000 tokens (for BOOP + BONUS rewards)  
   - **BOBOTRUM**: Send ~150,000 tokens (for BOBOTRUM rewards)

   Use your wallet to send these tokens directly to your contract address.

### Phase 4: Connect to Your App

6. **Update Your Project Configuration**
   - Open `server/blockchain.ts`
   - Replace `WHEEL_GAME_ADDRESS = ""` with your deployed contract address
   - Add your wallet private key to environment variables

7. **Set Environment Variables in Replit**
   - Go to Secrets tab in Replit
   - Add: `WALLET_PRIVATE_KEY` = your wallet's private key
   - This wallet will execute spins and distribute rewards

### Phase 5: Test Everything

8. **Test the Integration**
   - Spin the wheel in your app
   - Check if transactions appear on Arbiscan.io
   - Verify rewards are distributed to player wallets
   - Monitor gas costs and adjust if needed

## Security Checklist

✅ **Contract Security**
- Daily spin limits (5 per day) ✓
- Reentrancy protection ✓
- Emergency pause function ✓
- Owner-only admin functions ✓

✅ **Wallet Security**
- Keep private key secure in environment variables
- Use a dedicated wallet for the game (not your main wallet)
- Monitor contract balance regularly

## Troubleshooting Common Issues

**"Transaction Failed"**
- Check if contract has enough tokens for rewards
- Ensure player hasn't exceeded daily spin limit
- Verify wallet has enough ETH for gas

**"Contract Not Found"**
- Double-check contract address in blockchain.ts
- Ensure you're on Arbitrum mainnet (not testnet)

**"Insufficient Balance"**
- Fund the contract with more reward tokens
- Check token decimals (18 for all three tokens)

## Cost Estimates

- **Deployment**: ~$10-20 in ETH
- **Per Spin**: ~$1-3 in gas fees
- **Token Funding**: Your choice based on expected players

## Next Steps After Deployment

1. Test with small amounts first
2. Monitor player engagement and adjust rewards
3. Set up monitoring for contract balance
4. Plan for scaling as player base grows

## Support

If you get stuck:
1. Check Arbiscan.io for transaction details
2. Test on Arbitrum Sepolia testnet first
3. Start with smaller token amounts for testing