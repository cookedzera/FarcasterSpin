import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpinResultSchema } from "@shared/schema";

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
      if (spinsToday >= 2) {
        return res.status(400).json({ error: "Daily spin limit reached" });
      }

      // Generate random slot symbols
      const symbols = ['🎯', '🐸', '🪙', '💀', '🌈', '🍌'];
      const result = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];

      // Check for win (all symbols match)
      const isWin = result[0] === result[1] && result[1] === result[2];
      const rewardAmount = isWin ? Math.floor(Math.random() * 500) + 100 : 0;

      // Create spin result
      const spinResult = await storage.createSpinResult({
        userId,
        symbols: result,
        isWin,
        rewardAmount,
        rewardToken: "PEPE"
      });

      // Update user stats
      const today = new Date();
      const newSpinsUsed = spinsToday + 1;
      await storage.updateUser(userId, {
        spinsUsed: newSpinsUsed,
        totalSpins: user.totalSpins + 1,
        totalWins: user.totalWins + (isWin ? 1 : 0),
        lastSpinDate: today
      });

      // Update game stats
      const gameStats = await storage.getGameStats();
      await storage.updateGameStats({
        totalClaims: gameStats.totalClaims + (isWin ? 1 : 0),
        contractTxs: gameStats.contractTxs + 1
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

  const httpServer = createServer(app);
  return httpServer;
}
