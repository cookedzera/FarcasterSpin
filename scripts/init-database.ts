#!/usr/bin/env tsx

/**
 * Database initialization script
 * This script populates the database with initial data for development/testing
 */

import { db } from '../server/db';
import { tokens, users, gameStats, spinResults, tokenClaims } from '../shared/schema';
import { eq } from 'drizzle-orm';

const SAMPLE_TOKEN_ADDRESSES = {
  TOKEN1: '0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4', // USDC-like token
  TOKEN2: '0x0E1CD6557D2BA59C61c75850E674C2AD73253952', // WETH-like token  
  TOKEN3: '0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19', // ARB-like token
};

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // 1. Initialize tokens
    console.log('📝 Creating tokens...');
    
    const tokenData = [
      {
        address: SAMPLE_TOKEN_ADDRESSES.TOKEN1,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        isActive: true,
        rewardAmount: 1000000, // 1 USDC (6 decimals)
      },
      {
        address: SAMPLE_TOKEN_ADDRESSES.TOKEN2,
        symbol: 'WETH',
        name: 'Wrapped Ethereum',
        decimals: 18,
        isActive: true,
        rewardAmount: 100000000, // 0.0000001 WETH (fits in integer)
      },
      {
        address: SAMPLE_TOKEN_ADDRESSES.TOKEN3,
        symbol: 'ARB',
        name: 'Arbitrum Token',
        decimals: 18,
        isActive: true,
        rewardAmount: 500000000, // 0.0000005 ARB (fits in integer)
      },
    ];

    // Check if tokens already exist, if not create them
    for (const tokenInfo of tokenData) {
      const [existingToken] = await db.select().from(tokens).where(eq(tokens.address, tokenInfo.address));
      
      if (!existingToken) {
        await db.insert(tokens).values(tokenInfo);
        console.log(`✅ Created token: ${tokenInfo.symbol}`);
      } else {
        console.log(`⏭️  Token ${tokenInfo.symbol} already exists`);
      }
    }

    // 2. Initialize game stats
    console.log('📊 Creating initial game stats...');
    
    const [existingStats] = await db.select().from(gameStats).limit(1);
    
    if (!existingStats) {
      await db.insert(gameStats).values({
        totalClaims: 1247,
        contractTxs: 892,
      });
      console.log('✅ Created initial game stats');
    } else {
      console.log('⏭️  Game stats already exist');
    }

    // 3. Create sample users with realistic data
    console.log('👥 Creating sample users...');
    
    const sampleUsers = [
      {
        username: 'CryptoWhale92',
        walletAddress: '0x742d35Cc2C7b74a1b1C3E5e6a5FC3d2F8B9f8E1C',
        farcasterFid: 12345,
        farcasterUsername: 'cryptowhale',
        farcasterDisplayName: 'Crypto Whale 🐋',
        farcasterPfpUrl: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/41bbd77b-f9c3-4a95-9e61-07cdac82f900/rectcrop3',
        farcasterBio: 'Spinning wheels since 2021 🎰',
        totalSpins: 156,
        totalWins: 42,
        spinsUsed: 12,
        accumulatedToken1: '2500000', // 2.5 USDC
        accumulatedToken2: '1500000000000000', // 0.0015 WETH (realistic smaller amount)
        accumulatedToken3: '8750000000000000', // 0.00875 ARB (realistic smaller amount)
      },
      {
        username: 'DeFiMaster',
        walletAddress: '0x8B5C9f3b4A7d6E2F1C8D4B6A9E7F3C2D1E5A8B7C',
        farcasterFid: 67890,
        farcasterUsername: 'defimaster',
        farcasterDisplayName: 'DeFi Master ⚡',
        farcasterPfpUrl: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8e7a9b2c-d4f1-4e6b-a3c8-9f2e1d7b5a4c/rectcrop3',
        farcasterBio: 'Building the future of finance',
        totalSpins: 89,
        totalWins: 24,
        spinsUsed: 8,
        accumulatedToken1: '1750000', // 1.75 USDC
        accumulatedToken2: '750000000000000', // 0.00075 WETH
        accumulatedToken3: '6250000000000000', // 0.00625 ARB
      },
      {
        username: 'LuckySpinner',
        walletAddress: '0x3F2A8C7E9B6D1F4A8C7E9B6D1F4A8C7E9B6D1F4A',
        farcasterFid: 11111,
        farcasterUsername: 'luckyspinner',
        farcasterDisplayName: 'Lucky Spinner 🍀',
        farcasterBio: 'Fortune favors the bold!',
        totalSpins: 234,
        totalWins: 78,
        spinsUsed: 15,
        accumulatedToken1: '4250000', // 4.25 USDC
        accumulatedToken2: '2250000000000000', // 0.00225 WETH
        accumulatedToken3: '12750000000000000', // 0.01275 ARB
      },
      {
        username: 'ArbTrader',
        walletAddress: '0x7E4B2F9C6D8A3E5F2B9C6D8A3E5F2B9C6D8A3E5F',
        farcasterFid: 22222,
        farcasterUsername: 'arbtrader',
        farcasterDisplayName: 'ARB Trader 📈',
        farcasterBio: 'Arbitrum maximalist',
        totalSpins: 67,
        totalWins: 18,
        spinsUsed: 5,
        accumulatedToken1: '1250000', // 1.25 USDC
        accumulatedToken2: '500000000000000', // 0.0005 WETH
        accumulatedToken3: '3750000000000000', // 0.00375 ARB
      },
    ];

    for (const userInfo of sampleUsers) {
      const [existingUser] = await db.select().from(users).where(eq(users.username, userInfo.username));
      
      if (!existingUser) {
        await db.insert(users).values(userInfo);
        console.log(`✅ Created user: ${userInfo.username}`);
      } else {
        console.log(`⏭️  User ${userInfo.username} already exists`);
      }
    }

    // 4. Create sample spin results
    console.log('🎰 Creating sample spin results...');
    
    const [allUsers] = await db.select().from(users);
    const allTokens = await db.select().from(tokens);
    
    if (allUsers && allTokens.length > 0) {
      const sampleSpins = [
        {
          userId: allUsers.id,
          symbols: ['🍒', '🍒', '🍒'],
          isWin: true,
          rewardAmount: '1000000', // 1 USDC
          tokenType: 'TOKEN1',
          tokenId: allTokens[0].id,
          tokenAddress: allTokens[0].address,
          isAccumulated: true,
        },
        {
          userId: allUsers.id,
          symbols: ['⭐', '🍒', '🍋'],
          isWin: false,
          rewardAmount: '0',
          tokenType: null,
          tokenId: null,
          tokenAddress: null,
          isAccumulated: false,
        },
      ];

      for (const spin of sampleSpins) {
        await db.insert(spinResults).values(spin);
      }
      
      console.log('✅ Created sample spin results');
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`• Tokens: ${tokenData.length} configured`);
    console.log(`• Users: ${sampleUsers.length} sample users created`);
    console.log('• Game stats: Initial values set');
    console.log('• Sample spin results: Added');
    console.log('');
    console.log('🚀 Your Wheel of Fortune game is ready with realistic data!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization if this script is executed directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  initializeDatabase().then(() => {
    console.log('✅ Database initialization completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
}

export { initializeDatabase };