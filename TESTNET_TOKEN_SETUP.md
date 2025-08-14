# Test Token Setup for ArbCasino

## The Problem
The current random Arbitrum Sepolia token addresses may not have accessible faucets or minting functions, making it difficult to get test tokens for reward testing.

## The Solution
Deploy our own test tokens with built-in faucet functionality.

## Test Token Contracts

### 1. AIDOGE Test Token
- **Name**: AIDOGE Test
- **Symbol**: AIDOGE  
- **Decimals**: 18
- **Features**: Mintable by owner, public faucet (1000 max per call)

### 2. BOOP Test Token
- **Name**: BOOP Test
- **Symbol**: BOOP
- **Decimals**: 18  
- **Features**: Mintable by owner, public faucet (1000 max per call)

### 3. BOBOTRUM Test Token
- **Name**: BOBOTRUM Test
- **Symbol**: BOBOTRUM
- **Decimals**: 18
- **Features**: Mintable by owner, public faucet (1000 max per call)

## Deployment Process

### Option 1: Use Remix IDE (Recommended)
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `TestTokens.sol`
3. Copy the contract code from `contracts/TestTokens.sol`
4. Compile the contract
5. Connect to Arbitrum Sepolia testnet
6. Deploy each token contract:
   - AIDOGETest
   - BOOPTest  
   - BOBOTRUMTest
7. Copy the deployed addresses

### Option 2: Use Hardhat
1. Install Hardhat: `npm install --save-dev hardhat`
2. Configure `hardhat.config.js` for Arbitrum Sepolia
3. Run deployment script: `npx hardhat run scripts/deploy-tokens.js --network arbitrum-sepolia`

## Getting Test Tokens

Once deployed, anyone can get test tokens by calling the `faucet()` function:

```javascript
// Get 100 AIDOGE tokens
await aidogeContract.faucet(ethers.parseEther("100"));

// Get 500 BOOP tokens  
await boopContract.faucet(ethers.parseEther("500"));

// Get 1000 BOBOTRUM tokens (max per call)
await bobotrumContract.faucet(ethers.parseEther("1000"));
```

## Update Configuration

After deployment, update these files:

### 1. `server/blockchain.ts`
```typescript
export const TOKEN_ADDRESSES = {
  AIDOGE: "0xYourAIDOGEAddress",
  BOOP: "0xYourBOOPAddress", 
  BOBOTRUM: "0xYourBOBOTRUMAddress"
} as const;
```

### 2. `shared/schema.ts`
Add the token records to the database:

```sql
INSERT INTO tokens (address, symbol, name, decimals, reward_amount) VALUES
('0xYourAIDOGEAddress', 'AIDOGE', 'AIDOGE Test', 18, 100),
('0xYourBOOPAddress', 'BOOP', 'BOOP Test', 18, 250),
('0xYourBOBOTRUMAddress', 'BOBOTRUM', 'BOBOTRUM Test', 18, 500);
```

## Testing Workflow

1. **Deploy tokens** using Remix or Hardhat
2. **Fund your wallet** using the faucet functions
3. **Deploy the WheelGame contract** with the new token addresses
4. **Fund the WheelGame contract** with test tokens
5. **Test the spin and claim functionality**

## Verification

Verify your tokens are working:

```bash
# Check token details
node check-testnet-tokens.js

# Check wallet balance  
node testnet-deploy.js
```

## Advantages of This Approach

1. **Full Control**: We own and control the test tokens
2. **Unlimited Supply**: Can mint more tokens as needed
3. **Public Faucet**: Anyone can get test tokens for testing
4. **Real ERC20**: Behaves exactly like mainnet tokens
5. **No External Dependencies**: Don't rely on third-party faucets

## Security Note

These are **testnet-only tokens** with no real value. Never use this pattern on mainnet with real tokens.