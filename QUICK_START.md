# Quick Start - Deploy in 10 Minutes

## What You Need
1. MetaMask wallet with ETH on Arbitrum (~$20 worth)
2. Reward tokens: AIDOGE, BOOP, BOBOTRUM
3. 10 minutes of your time

## Steps

### 1. Open Remix
- Go to https://remix.ethereum.org
- Create new file: `WheelGame.sol`
- Copy code from `contracts/WheelGame.sol`

### 2. Compile & Deploy
- Click "Solidity Compiler" → Compile
- Click "Deploy & Run" → Set to "Injected Provider"
- Make sure MetaMask is on Arbitrum network
- Click "Deploy" → Confirm in MetaMask

### 3. Get Your Contract Address
- Copy the address that appears after deployment
- Example: `0x1234...abcd`

### 4. Update Your App
Replace in `server/blockchain.ts`:
```javascript
const WHEEL_GAME_ADDRESS = "0x1234...abcd"; // Your address here
```

### 5. Add Wallet Secret
In Replit Secrets tab:
- Key: `WALLET_PRIVATE_KEY`
- Value: Your wallet's private key

### 6. Fund Contract
Send tokens to your contract address:
- 500k AIDOGE
- 200k BOOP  
- 150k BOBOTRUM

### 7. Test
- Restart your app
- Try spinning the wheel
- Check if rewards appear in player wallets

## Troubleshooting
- **"Contract not found"**: Check address in blockchain.ts
- **"Transaction failed"**: Ensure contract has tokens
- **"No spins left"**: Daily limit is 5 per wallet

## Success Indicators
✅ Contract deployed on Arbiscan.io
✅ Tokens sent to contract
✅ App spins work without errors
✅ Players receive real token rewards