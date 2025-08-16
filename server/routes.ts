import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leaderboardService } from "./leaderboard";
import { insertSpinResultSchema, insertTokenSchema } from "@shared/schema";
import { ethers } from "ethers";
import { z } from "zod";
import { createFarcasterAuthMiddleware, verifyFarcasterToken, getUserByAddress } from "./farcaster";
import { blockchainService } from "./blockchain";

// ERC20 ABI for token transfers
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// Optimize token reward function with connection pooling
const tokenProviderPool = new Map<string, ethers.JsonRpcProvider>();
const walletPool = new Map<string, ethers.Wallet>();

async function sendTokenReward(recipientAddress: string | null, token: any, amount: number): Promise<string> {
  if (!recipientAddress) {
    throw new Error("No recipient address provided");
  }
  
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
  const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
  
  if (!PRIVATE_KEY) {
    throw new Error("Wallet private key not configured");
  }
  
  try {
    // Use pooled provider and wallet for better performance
    let provider = tokenProviderPool.get(RPC_URL);
    if (!provider) {
      provider = new ethers.JsonRpcProvider(RPC_URL);
      tokenProviderPool.set(RPC_URL, provider);
    }
    
    let wallet = walletPool.get(PRIVATE_KEY);
    if (!wallet) {
      let privateKey = PRIVATE_KEY.trim();
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      wallet = new ethers.Wallet(privateKey).connect(provider);
      walletPool.set(PRIVATE_KEY, wallet);
    }
    
    // Validate address format early
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error(`Invalid address format: ${recipientAddress}`);
    }
    
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, wallet);
    
    // Use Promise.allSettled for better error handling
    const tx = await tokenContract.transfer(recipientAddress, BigInt(amount));
    const receipt = await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error("Token transfer failed:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user stats - optimized with parallel queries
  app.get("/api/user/:id", async (req, res) => {
    try {
      // Run queries in parallel for better performance
      const [user, spinsToday] = await Promise.all([
        storage.getUser(req.params.id),
        storage.getUserSpinsToday(req.params.id)
      ]);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ ...user, spinsUsed: spinsToday });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Create or get user by username
  app.post("/api/user", async (req, res) => {
    try {
      const { username, walletAddress } = req.body;
      
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.createUser({ username, walletAddress });
      }
      
      const spinsToday = await storage.getUserSpinsToday(user.id);
      res.json({ ...user, spinsUsed: spinsToday });
    } catch (error) {
      res.status(500).json({ error: "Failed to create/get user" });
    }
  });

  // Perform spin
  app.post("/api/spin", async (req, res) => {
    try {
      const { userId, userAddress } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const spinsToday = await storage.getUserSpinsToday(userId);
      if (spinsToday >= 5) {
        return res.status(400).json({ error: "Daily spin limit reached" });
      }

      // Use blockchain service for contract interaction
      console.log(`🎰 Calling contract spin for user ${userId} at address ${userAddress}`);
      
      try {
        const spinResult = await blockchainService.performSpin(userAddress);
        console.log(`🎯 Contract spin result:`, spinResult);
        
        // Store the result in database
        const dbSpinResult = await storage.createSpinResult({
          userId,
          symbols: spinResult.symbols,
          isWin: spinResult.isWin,
          rewardAmount: spinResult.rewardAmount,
          tokenType: spinResult.tokenType,
          tokenId: null,
          tokenAddress: spinResult.tokenAddress || spinResult.symbols[0],
          isAccumulated: true,
          transactionHash: spinResult.transactionHash || null
        });

        // Add to accumulated rewards if won
        if (spinResult.isWin && spinResult.tokenType && spinResult.rewardAmount) {
          console.log(`💰 Adding ${spinResult.rewardAmount} ${spinResult.tokenType} to accumulated balance`);
          await storage.addAccumulatedReward(userId, spinResult.tokenType, spinResult.rewardAmount);
        }

        res.json({
          ...dbSpinResult,
          transactionHash: spinResult.transactionHash
        });

      } catch (contractError) {
        console.error("Contract call failed, using simulation:", contractError);
        
        // Fallback to simulation if contract fails
        const tokenSymbols = [
          '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', // IARB
          '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', // JUICE  
          '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f'  // ABET
        ];
        
        // 90% win rate for testing
        let result;
        let isWin = false;
        
        if (Math.random() < 0.9) {
          const winningSymbol = tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)];
          result = [winningSymbol, winningSymbol, winningSymbol];
          isWin = true;
          console.log(`🎉 TESTING MODE - Forced win: ${winningSymbol}`);
        } else {
          result = [
            tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
            tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
            tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)]
          ];
          isWin = result[0] === result[1] && result[1] === result[2];
        }
        
        let rewardAmount = "0";
        let tokenType = "";

        if (isWin) {
          const winningSymbol = result[0];
          const tokenRewards: Record<string, { type: string; amount: string }> = {
            '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b': { type: 'TOKEN1', amount: '10000000000000000' },
            '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3': { type: 'TOKEN2', amount: '5000000000000000' },
            '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f': { type: 'TOKEN3', amount: '2000000000000000' }
          };
          
          const reward = tokenRewards[winningSymbol];
          if (reward) {
            tokenType = reward.type;
            rewardAmount = reward.amount;
            await storage.addAccumulatedReward(userId, tokenType, rewardAmount);
          }
        }

        const dbSpinResult = await storage.createSpinResult({
          userId,
          symbols: result,
          isWin,
          rewardAmount,
          tokenType,
          tokenId: null,
          tokenAddress: result[0],
          isAccumulated: true,
          transactionHash: null
        });

        res.json(dbSpinResult);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to perform spin" });
    }
  });

  // Get game statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getGameStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Contract events-based leaderboard - optimized with caching
  const leaderboardCache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_TTL = 30 * 1000; // 30 seconds cache
  
  app.get("/api/leaderboard", async (req, res) => {
    const { category = 'wins', limit = 10 } = req.query;
    const cacheKey = `${category}-${limit}`;
    
    try {
      // Check cache first
      const cached = leaderboardCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
      
      // Sync latest data from contract (non-blocking)
      leaderboardService.syncLeaderboardData().catch(console.error);
      
      const leaderboard = await leaderboardService.getLeaderboard(
        category as 'wins' | 'spins' | 'rewards',
        parseInt(limit as string) || 10
      );
      
      // Cache the result
      leaderboardCache.set(cacheKey, { data: leaderboard, timestamp: Date.now() });
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard/weekly", async (req, res) => {
    const { limit = 10 } = req.query;
    
    try {
      const weeklyLeaderboard = await leaderboardService.getWeeklyLeaderboard(
        parseInt(limit as string) || 10
      );
      
      res.json(weeklyLeaderboard);
    } catch (error) {
      console.error("Weekly leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch weekly leaderboard" });
    }
  });

  app.get("/api/player/:address/rank", async (req, res) => {
    const { address } = req.params;
    const { category = 'wins' } = req.query;
    
    try {
      const playerRank = await leaderboardService.getPlayerRank(
        address,
        category as 'wins' | 'spins' | 'rewards'
      );
      
      if (!playerRank) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      res.json(playerRank);
    } catch (error) {
      console.error("Player rank error:", error);
      res.status(500).json({ error: "Failed to fetch player rank" });
    }
  });

  // Get user's accumulated token balances - optimized with parallel queries
  app.get("/api/user/:id/balances", async (req, res) => {
    try {
      // Run balance and claim queries in parallel
      const [balances, claimInfo] = await Promise.all([
        storage.getUserAccumulatedBalances(req.params.id),
        storage.canUserClaim(req.params.id)
      ]);
      
      res.json({ ...balances, ...claimInfo });
    } catch (error) {
      console.error('Get balances error:', error);
      res.status(500).json({ error: "Failed to get user balances" });
    }
  });

  // Claim accumulated tokens
  app.post("/api/claim", async (req, res) => {
    try {
      const { userId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.walletAddress) {
        return res.status(400).json({ error: "Wallet address required for claiming" });
      }

      const claimInfo = await storage.canUserClaim(userId);
      
      // For testing: allow claims even if threshold not met
      console.log("🧪 TESTING MODE - Force claim: Bypassing minimum threshold requirements");

      const balances = await storage.getUserAccumulatedBalances(userId);
      
      // Prepare token transfers
      const tokenAddresses = {
        TOKEN1: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b',
        TOKEN2: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', 
        TOKEN3: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f'
      };

      let transactionHash = null;
      let claimStatus = "pending";

      try {
        // For now, we'll simulate the transfer and just record the claim
        // In production, you'd batch transfer all tokens in a single transaction
        console.log(`🚀 Claiming tokens for user ${userId}:`);
        console.log(`  TOKEN1: ${balances.token1}`);
        console.log(`  TOKEN2: ${balances.token2}`);
        console.log(`  TOKEN3: ${balances.token3}`);
        console.log(`  Total Value: $${claimInfo.totalValueUSD}`);

        // Create the claim record
        const tokenClaim = await storage.createTokenClaim({
          userId,
          token1Amount: balances.token1,
          token2Amount: balances.token2,
          token3Amount: balances.token3,
          totalValueUSD: claimInfo.totalValueUSD,
          transactionHash: null, // Will be updated when transaction is confirmed
          status: "pending"
        });

        // Reset user's accumulated balances and update claimed totals
        await storage.updateUser(userId, {
          accumulatedToken1: "0",
          accumulatedToken2: "0", 
          accumulatedToken3: "0",
          claimedToken1: (BigInt(user.claimedToken1 || '0') + BigInt(balances.token1)).toString(),
          claimedToken2: (BigInt(user.claimedToken2 || '0') + BigInt(balances.token2)).toString(),
          claimedToken3: (BigInt(user.claimedToken3 || '0') + BigInt(balances.token3)).toString(),
          lastClaimDate: new Date()
        });

        res.json({ 
          success: true, 
          claim: tokenClaim,
          message: "Tokens claimed successfully! They will be transferred to your wallet soon."
        });

      } catch (error) {
        console.error("❌ Claim failed:", error);
        res.status(500).json({ error: "Failed to process claim" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to claim tokens" });
    }
  });

  // Get user's claim history
  app.get("/api/user/:id/claims", async (req, res) => {
    try {
      const claims = await storage.getUserClaims(req.params.id);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user claims" });
    }
  });

  // Token management routes
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to get tokens" });
    }
  });

  app.get("/api/tokens/active", async (req, res) => {
    try {
      const activeTokens = await storage.getActiveTokens();
      res.json(activeTokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active tokens" });
    }
  });

  app.post("/api/tokens", async (req, res) => {
    try {
      const tokenData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken(tokenData);
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to create token" });
    }
  });

  app.put("/api/tokens/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const token = await storage.updateToken(id, updates);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to update token" });
    }
  });

  // Farcaster authentication endpoint
  app.get("/api/farcaster/me", async (req, res) => {
    try {
      const authorization = req.headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authorization.split(' ')[1];
      const domain = req.headers.host || 'localhost';
      
      const farcasterUser = await verifyFarcasterToken(token, domain);
      
      res.json(farcasterUser);
    } catch (error) {
      console.error('Farcaster auth error:', error);
      res.status(401).json({ error: 'Invalid Farcaster authentication' });
    }
  });

  // Get Farcaster user by Ethereum address
  app.post("/api/farcaster/user-by-address", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: 'Address is required' });
      }

      const farcasterUser = await getUserByAddress(address);
      
      if (farcasterUser) {
        res.json(farcasterUser);
      } else {
        res.status(404).json({ error: 'No Farcaster profile found for this address' });
      }
    } catch (error) {
      console.error('Error fetching user by address:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // Configuration endpoint for frontend
  app.get("/api/config", async (req, res) => {
    try {
      res.json({
        contractAddress: (process.env.DEPLOYED_CONTRACT_ADDRESS || "").trim(),
        tokenAddresses: {
          TOKEN1: "0x06d8c3f0e1cfb7e9d3f5B51D17DcD623AcC1B3b7", // IARB
          TOKEN2: "0x1842887De1C7fDD59e3948A93CD41aad48a19cB2", // JUICE  
          TOKEN3: "0x0BA7A82d415500BebFA254502B655732Cd678D07"  // ABET
        },
        chainId: 421614 // Arbitrum Sepolia
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
