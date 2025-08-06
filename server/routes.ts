import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpinResultSchema, insertTokenSchema } from "@shared/schema";
import { ethers } from "ethers";
import { z } from "zod";

// Wallet configuration - Using Base Sepolia testnet
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const RPC_URL = "https://sepolia.base.org";

// ERC20 ABI for token transfers
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function sendTokenReward(recipientAddress: string | null, token: any, amount: number): Promise<string> {
  if (!recipientAddress) {
    throw new Error("No recipient address provided");
  }
  
  if (!PRIVATE_KEY) {
    console.warn("No private key configured - using mock transaction hash");
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, wallet);
    
    // Validate the recipient address format (no ENS resolution needed)
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error(`Invalid address format: ${recipientAddress}`);
    }
    
    // Send the token transfer transaction
    const tx = await tokenContract.transfer(recipientAddress, BigInt(amount));
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error("Token transfer failed:", error);
    // Return mock hash for demo purposes
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user stats
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const spinsToday = await storage.getUserSpinsToday(req.params.id);
      res.json({ ...user, spinsUsed: spinsToday });
    } catch (error) {
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
      const { userId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const spinsToday = await storage.getUserSpinsToday(userId);
      if (spinsToday >= 5) {
        return res.status(400).json({ error: "Daily spin limit reached" });
      }

      // Generate random slot symbols using token addresses
      const tokenSymbols = [
        '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', // AIDOGE
        '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', // BOOP
        '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f'  // CATCH
      ];
      const result = [
        tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
        tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
        tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)]
      ];

      // Check for win (all symbols match)
      const isWin = result[0] === result[1] && result[1] === result[2];
      
      let rewardAmount = 0;
      let selectedToken = null;
      let transactionHash = null;

      if (isWin) {
        // Get a random active token for reward
        const activeTokens = await storage.getActiveTokens();
        if (activeTokens.length > 0) {
          selectedToken = activeTokens[Math.floor(Math.random() * activeTokens.length)];
          rewardAmount = selectedToken.rewardAmount || 0;
          
          // Send tokens to user (mock transaction for now)
          try {
            transactionHash = await sendTokenReward(user.walletAddress, selectedToken, rewardAmount);
          } catch (error) {
            console.log("Token transfer simulation:", error);
            // For demo purposes, create a mock transaction hash
            transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          }
        }
      }

      // Create spin result
      const spinResult = await storage.createSpinResult({
        userId,
        symbols: result,
        isWin,
        rewardAmount,
        tokenId: selectedToken?.id,
        tokenAddress: selectedToken?.address,
        transactionHash
      });

      // Update user stats
      const today = new Date();
      const newSpinsUsed = spinsToday + 1;
      await storage.updateUser(userId, {
        spinsUsed: newSpinsUsed,
        totalSpins: (user.totalSpins || 0) + 1,
        totalWins: (user.totalWins || 0) + (isWin ? 1 : 0),
        lastSpinDate: today
      });

      // Update game stats
      const gameStats = await storage.getGameStats();
      await storage.updateGameStats({
        totalClaims: (gameStats.totalClaims || 0) + (isWin ? 1 : 0),
        contractTxs: (gameStats.contractTxs || 0) + 1
      });

      res.json(spinResult);
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

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to get leaderboard" });
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

  const httpServer = createServer(app);
  return httpServer;
}
