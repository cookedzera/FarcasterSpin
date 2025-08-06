# ⚠️ TESTING MODE ACTIVE

## Current Configuration
- **Network**: Base Sepolia testnet
- **USDC Token**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- **Test Address**: 0xc64FabCF0A4BE88C5d7f67fE2e674ed81e00bB20

## Testing Modifications
✅ **Force Win**: Every spin now results in a winning combination  
✅ **Override Address**: All rewards sent to test address instead of player wallet  
✅ **Real Transactions**: Will attempt actual USDC transfers on Base Sepolia  

## Reward Details
- **Amount**: 100 units (0.0001 USDC)
- **Target**: 0xc64FabCF0A4BE88C5d7f67fE2e674ed81e00bB20
- **Network**: Base Sepolia testnet

## How to Test
1. Play the game - every spin will win
2. Check console logs for transaction attempts
3. Verify transactions on https://sepolia.basescan.org/
4. Look for USDC transfers to the test address

## Important Notes
- This is for testing only - remember to disable before production
- Requires testnet USDC in the wallet to actually send rewards
- Transaction hashes will appear in console logs