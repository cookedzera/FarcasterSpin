# ArbCasino Smart Contracts

## Overview
Smart contracts for the ArbCasino Wheel of Fortune game on Arbitrum mainnet, integrated with real token rewards.

## Token Integration
- **AIDOGE**: 0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b
- **BOOP**: 0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3  
- **BOBOTRUM**: 0x60460971a3D79ef265dfafA393ffBCe97d91E8B8

## Reward Structure
- **JACKPOT**: 50,000 AIDOGE
- **AIDOGE**: 10,000 AIDOGE
- **BOOP**: 20,000 BOOP
- **BOBOTRUM**: 15,000 BOBOTRUM
- **BONUS**: 5,000 BOOP
- **BUST**: No reward

## Game Rules
- 5 spins per day per wallet
- Daily limit resets at UTC midnight
- Rewards accumulate and can be claimed in batches
- All spins are executed on-chain for transparency

## Deployment Steps
1. Install dependencies: `npm install @openzeppelin/contracts`
2. Compile contract: `solc --optimize --abi --bin contracts/WheelGame.sol -o build/`
3. Deploy to Arbitrum mainnet using deploy script
4. Update WHEEL_GAME_ADDRESS in server/blockchain.ts
5. Fund contract with reward tokens

## Integration Features
- Real-time blockchain spin execution
- On-chain reward verification  
- Batch claiming to minimize gas fees
- Player statistics tracking
- Admin controls for reward adjustments
- Emergency pause functionality

## Security Features
- ReentrancyGuard protection
- Pausable contract functionality
- Owner-only admin functions
- Daily spin limits enforcement
- Safe token transfer handling