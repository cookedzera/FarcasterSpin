import express from "express";
import { createServer } from "http";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple storage interface
class MemStorage {
  constructor() {
    this.users = new Map();
    this.gameStats = {
      id: Math.random().toString(36),
      date: new Date(),
      totalClaims: 1024,
      contractTxs: 839,
    };
    this.spinResults = new Map();
    this.tokens = new Map();
    
    this.initializeMockData();
    this.initializeTokens();
  }

  initializeMockData() {
    const generateMockAddress = () => `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    const mockUsers = [
      { username: "0xAb...C1F", walletAddress: generateMockAddress(), spinsUsed: 2, totalWins: 4, totalSpins: 4 },
      { username: "0xD2...B12", walletAddress: generateMockAddress(), spinsUsed: 2, totalWins: 3, totalSpins: 5 },
      { username: "0xE3...A45", walletAddress: generateMockAddress(), spinsUsed: 1, totalWins: 2, totalSpins: 3 },
      { username: "0xF4...B67", walletAddress: generateMockAddress(), spinsUsed: 2, totalWins: 2, totalSpins: 4 },
      { username: "0xG5...C89", walletAddress: generateMockAddress(), spinsUsed: 1, totalWins: 1, totalSpins: 2 },
    ];

    mockUsers.forEach(user => {
      const id = Math.random().toString(36);
      const fullUser = {
        id,
        ...user,
        lastSpinDate: new Date(),
        createdAt: new Date(),
      };
      this.users.set(id, fullUser);
    });
  }

  initializeTokens() {
    const tokensData = [
      {
        address: "0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b",
        symbol: "TOKEN1",
        name: "First Token",
        decimals: 18,
        isActive: true,
        rewardAmount: 50000000000000
      },
      {
        address: "0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3",
        symbol: "TOKEN2", 
        name: "Second Token",
        decimals: 18,
        isActive: true,
        rewardAmount: 100000000000000
      },
      {
        address: "0xbc4c97fb9befaa8b41448e1dfcc5236da543217f",
        symbol: "TOKEN3",
        name: "Third Token", 
        decimals: 18,
        isActive: true,
        rewardAmount: 25000000000000
      }
    ];

    tokensData.forEach(tokenData => {
      const id = Math.random().toString(36);
      const token = {
        id,
        ...tokenData,
      };
      this.tokens.set(id, token);
    });
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser) {
    const id = Math.random().toString(36);
    const user = { 
      ...insertUser,
      walletAddress: insertUser.walletAddress || null,
      id,
      spinsUsed: 0,
      totalWins: 0,
      totalSpins: 0,
      lastSpinDate: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getGameStats() {
    return this.gameStats;
  }

  async updateGameStats(updates) {
    this.gameStats = { ...this.gameStats, ...updates };
    return this.gameStats;
  }

  async createSpinResult(result) {
    const id = Math.random().toString(36);
    const spinResult = {
      ...result,
      rewardAmount: result.rewardAmount || 0,
      userId: result.userId || null,
      symbols: result.symbols || null,
      isWin: result.isWin || false,
      tokenId: result.tokenId || null,
      tokenAddress: result.tokenAddress || null,
      transactionHash: result.transactionHash || null,
      id,
      timestamp: new Date(),
    };
    this.spinResults.set(id, spinResult);
    return spinResult;
  }

  async getLeaderboard() {
    return Array.from(this.users.values())
      .sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0))
      .slice(0, 10);
  }

  async getUserSpinsToday(userId) {
    const user = this.users.get(userId);
    if (!user || !user.lastSpinDate) return 0;
    
    const today = new Date();
    const lastSpin = new Date(user.lastSpinDate);
    
    if (
      today.getUTCDate() === lastSpin.getUTCDate() &&
      today.getUTCMonth() === lastSpin.getUTCMonth() &&
      today.getUTCFullYear() === lastSpin.getUTCFullYear()
    ) {
      return user.spinsUsed || 0;
    }
    
    return 0;
  }

  async getTokens() {
    return Array.from(this.tokens.values());
  }

  async createToken(insertToken) {
    const id = Math.random().toString(36);
    const token = {
      ...insertToken,
      decimals: insertToken.decimals || 18,
      isActive: insertToken.isActive !== undefined ? insertToken.isActive : true,
      rewardAmount: insertToken.rewardAmount || 100,
      id,
    };
    this.tokens.set(id, token);
    return token;
  }

  async updateToken(id, updates) {
    const token = this.tokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  async getActiveTokens() {
    return Array.from(this.tokens.values()).filter(token => token.isActive);
  }
}

const storage = new MemStorage();

// Express app setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// API Routes
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

    // Generate random slot machine symbols
    const tokenSymbols = [
      '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b',
      '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3',
      '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f'
    ];
    
    const result = [
      tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
      tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)],
      tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)]
    ];

    const isWin = result[0] === result[1] && result[1] === result[2];
    
    let rewardAmount = 0;
    let selectedToken = null;
    let transactionHash = null;

    if (isWin) {
      const activeTokens = await storage.getActiveTokens();
      if (activeTokens.length > 0) {
        selectedToken = activeTokens[Math.floor(Math.random() * activeTokens.length)];
        rewardAmount = selectedToken.rewardAmount || 0;
        transactionHash = `mock_${Math.random().toString(36)}`;
      }
    }

    const spinResult = await storage.createSpinResult({
      userId,
      symbols: result,
      isWin,
      rewardAmount,
      tokenId: selectedToken?.id,
      tokenAddress: selectedToken?.address,
      transactionHash
    });

    const today = new Date();
    const newSpinsUsed = spinsToday + 1;
    await storage.updateUser(userId, {
      spinsUsed: newSpinsUsed,
      totalSpins: (user.totalSpins || 0) + 1,
      totalWins: (user.totalWins || 0) + (isWin ? 1 : 0),
      lastSpinDate: today
    });

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

app.get("/api/stats", async (req, res) => {
  try {
    const stats = await storage.getGameStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
} else {
  // In development, setup Vite
  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, "../client"),
    });
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  } catch (e) {
    console.error("Error setting up Vite:", e);
  }
}

// Error handling
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Start server
const port = parseInt(process.env.PORT || '5000', 10);
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`[express] serving on port ${port}`);
});