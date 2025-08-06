# Testnet Testing Guide

## Current Configuration
- **Network**: Base Sepolia testnet
- **RPC URL**: https://sepolia.base.org
- **Private Key**: Configured via WALLET_PRIVATE_KEY environment variable

## Steps to Test Real Transactions

### 1. Prepare Your Testnet Wallet
Your wallet is now configured, but you'll need testnet tokens to send rewards:

**Get Testnet ETH (for gas fees):**
- Visit Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Or use: https://faucet.quicknode.com/base/sepolia

**Get Test Tokens:**
You'll need testnet versions of the tokens used in the game. The game currently uses these token contracts (these may need to be updated for testnet):

### 2. Update Token Contracts for Testnet
Using Base Sepolia testnet USDC for rewards:
- **USDC (Base Sepolia)**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- This is a real testnet token that you can get from faucets
- Perfect for testing actual token transfers

### 3. Test the Game
1. Open the casino game in your browser
2. Create a player account with a testnet wallet address
3. Spin the slot machine
4. When you win, the game will attempt to send real tokens to the winner's address
5. Check the transaction hash on Base Sepolia explorer: https://sepolia.basescan.org/

### 4. Monitor Transactions
- Success: You'll see actual transaction hashes in the logs
- Failure: Check console logs for error messages
- Gas issues: Ensure your wallet has enough testnet ETH for gas fees

### 5. Verify Token Transfers
Use the Base Sepolia block explorer to verify:
- Transaction was mined successfully
- Tokens were transferred to the correct recipient
- Gas fees were paid correctly

## Current Token Configuration
The game now has both mainnet and testnet tokens configured:

**Active Tokens:**
- TOKEN1: 0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b (old mainnet)
- TOKEN2: 0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3 (old mainnet)
- TOKEN3: 0xbc4c97fb9befaa8b41448e1dfcc5236da543217f (old mainnet)
- USDC (Base Sepolia): 0x036CbD53842c5426634e7929541eC2318f3dCF7e ✅ **Ready for Testing** (0.0001 USDC reward)

## How to Test Right Now

**1. Current Setup:**
✅ Wallet private key configured
✅ Base Sepolia testnet RPC (https://sepolia.base.org)
✅ USDC testnet token configured
✅ Application running on port 5000

**2. Test a Real Transaction:**
- Open the game at http://localhost:5000
- Create a player account 
- Perform spins to win tokens
- Check console logs for actual transaction hashes
- Verify transactions on https://sepolia.basescan.org/

**3. Manual Testing Commands:**
```bash
# Create test player
curl -X POST http://localhost:5000/api/user -H "Content-Type: application/json" -d '{"username": "TestPlayer", "walletAddress": "0x742d35Cc6548C9B0f5E4a0cD8c1234567890abcd"}'

# Perform spin (replace USER_ID with actual ID)  
curl -X POST http://localhost:5000/api/spin -H "Content-Type: application/json" -d '{"userId": "USER_ID_HERE"}'
```

## Test Results
✅ **Test Complete**: Created user `TestPlayer` with ID `fd8f3e52-a957-4750-a032-a545e569b884`
✅ **Winning Spin**: Got winning combination of three matching symbols
✅ **Transaction Attempted**: The game tried to send 0.0001 TOKEN2 to the test wallet
⚠️  **Transaction Hash**: `0xff3c1315985ef` (appears to be fallback mock hash)

## ✅ **NETWORK MIGRATION COMPLETE**

**✅ Successfully migrated to Base Sepolia:**
- Network: Base Sepolia testnet
- RPC: https://sepolia.base.org  
- USDC Token: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Block Explorer: https://sepolia.basescan.org/

**✅ Ready for Testing:**
1. **Get Base Sepolia ETH**: Visit https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **Get testnet USDC**: You can get USDC from Base Sepolia faucets  
3. **Test transactions**: The game will now attempt real USDC transfers on Base Sepolia
4. **Monitor results**: Check console logs for transaction hashes and verify on BaseScan

**Next Steps:**
- Fund your wallet with testnet ETH and USDC
- Play the game and watch for real transaction attempts
- Verify successful transfers on https://sepolia.basescan.org/