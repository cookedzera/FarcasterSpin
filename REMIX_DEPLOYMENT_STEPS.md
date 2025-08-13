# Remix IDE Deployment Guide - Arbitrum Sepolia Testnet

## Step 1: Open Remix IDE
Go to: **https://remix.ethereum.org**

## Step 2: Create Contract File
1. In the file explorer, create a new file: `WheelGameImproved.sol`
2. Copy the entire contract code from our project (I'll show you below)
3. Paste it into Remix

## Step 3: Compile Contract
1. Go to "Solidity Compiler" tab (📄 icon)
2. Set compiler version to `0.8.19` or higher
3. Click "Compile WheelGameImproved.sol"
4. Wait for green checkmark ✅

## Step 4: Deploy Contract
1. Go to "Deploy & Run Transactions" tab (🚀 icon)
2. In "Environment", select **"Injected Provider - MetaMask"**
3. MetaMask will popup - connect your wallet
4. In MetaMask, switch to **"Arbitrum Sepolia"** network
5. Confirm your address shows: `0x3b0287dDC6dD5a22862702dd2FB6E3Aa17429cB6`

## Step 5: Configure Constructor Parameters
Before deploying, set these parameters:

**Token Addresses (our testnet tokens):**
- token1: `0x06d8c3f0e1cfb7e9d3f5b51d17dcd623acc1b3b7` (IARB)
- token2: `0x1842887de1c7fdd59e3948a93cd41aad48a19cb2` (JUICE)  
- token3: `0x0ba7a82d415500bebfa254502b655732cd678d07` (aBET)

**Reward Amounts (in wei, 18 decimals):**
- reward1: `1000000000000000000` (1 token)
- reward2: `2000000000000000000` (2 tokens)
- reward3: `5000000000000000000` (5 tokens)

## Step 6: Deploy
1. Click "Deploy" button
2. MetaMask will popup - confirm transaction
3. Wait for deployment confirmation
4. Copy the contract address from Remix

## Step 7: Verify Deployment
Once deployed, you'll see the contract in Remix with all its functions. Test a few read functions to make sure it works.

## Next Steps After Deployment:
1. Update our app with the new contract address
2. Test the complete wheel game
3. Verify token rewards work correctly

**Your Testnet Balance: 0.08 ETH - Perfect for deployment!**