# Complete Remix IDE Deployment Guide for Test Tokens

## Step 1: Prepare Remix IDE

1. **Open Remix IDE**: Go to https://remix.ethereum.org/
2. **Create New File**: Click "+" in file explorer, name it `TestTokens.sol`
3. **Copy Contract Code**: Copy the entire contents from `contracts/TestTokens.sol`

## Step 2: Compile the Contracts

1. **Go to Solidity Compiler Tab** (left sidebar)
2. **Select Compiler Version**: 0.8.20 or higher
3. **Enable Optimization**: Check "Enable optimization"
4. **Click Compile TestTokens.sol**
5. **Verify Success**: Green checkmark should appear

## Step 3: Connect to Arbitrum Sepolia

1. **Go to Deploy & Run Tab** (left sidebar)
2. **Environment**: Select "Injected Provider - MetaMask"
3. **Network**: Make sure MetaMask shows "Arbitrum Sepolia"
4. **Account**: Your wallet address should appear
5. **Check Balance**: Ensure you have testnet ETH

## Step 4: Deploy Each Token

### Deploy AIDOGE Test Token
1. **Select Contract**: Choose "AIDOGETest" from dropdown
2. **Click Deploy**: Orange deploy button
3. **Confirm in MetaMask**: Pay gas fee
4. **Copy Address**: From deployed contracts section
5. **Save Address**: Write down the contract address

### Deploy BOOP Test Token
1. **Select Contract**: Choose "BOOPTest" from dropdown
2. **Click Deploy**: Orange deploy button
3. **Confirm in MetaMask**: Pay gas fee
4. **Copy Address**: From deployed contracts section
5. **Save Address**: Write down the contract address

### Deploy BOBOTRUM Test Token
1. **Select Contract**: Choose "BOBOTRUMTest" from dropdown
2. **Click Deploy**: Orange deploy button
3. **Confirm in MetaMask**: Pay gas fee
4. **Copy Address**: From deployed contracts section
5. **Save Address**: Write down the contract address

## Step 5: Test Your Tokens

After deployment, test each token:

1. **Expand Deployed Contract** in Remix
2. **Call `name()`**: Should return token name
3. **Call `symbol()`**: Should return token symbol
4. **Call `totalSupply()`**: Should return 1000000000000000000000000
5. **Call `faucet(1000000000000000000000)`**: Get 1000 test tokens

## Step 6: Verify on Block Explorer

1. Go to https://sepolia.arbiscan.io/
2. Search for each contract address
3. Verify the contracts are deployed correctly
4. Check transaction history

## Expected Results

You should get 3 contract addresses that look like:
- **AIDOGE**: `0x1234...abcd`
- **BOOP**: `0x5678...efgh`
- **BOBOTRUM**: `0x9012...ijkl`

## Next Steps

After successful deployment:
1. **Save all 3 contract addresses**
2. **Update the ArbCasino configuration** with new addresses
3. **Get test tokens** using the faucet function
4. **Test the game** with real token rewards

## Troubleshooting

### Common Issues:
- **Out of gas**: Increase gas limit to 1,500,000
- **Transaction failed**: Check you have enough testnet ETH
- **Network wrong**: Verify you're on Arbitrum Sepolia (Chain ID: 421614)
- **Compilation error**: Make sure you're using Solidity 0.8.20+

### Gas Estimates:
- Each token deployment: ~0.002 ETH
- Total for 3 tokens: ~0.006 ETH
- Get 0.01 ETH from faucet to be safe

## Contract Functions Available

### Read Functions:
- `name()`: Token name
- `symbol()`: Token symbol  
- `decimals()`: Always 18
- `totalSupply()`: Total tokens minted
- `balanceOf(address)`: Balance of address

### Write Functions:
- `faucet(uint256 amount)`: Get free tokens (max 1000 per call)
- `mint(address to, uint256 amount)`: Owner only
- `transfer(address to, uint256 amount)`: Send tokens