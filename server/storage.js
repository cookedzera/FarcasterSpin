import { randomUUID } from "crypto";

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.gameStats = {
      id: randomUUID(),
      date: new Date(),
      totalClaims: 1024,
      contractTxs: 839,
    };
    this.spinResults = new Map();
    this.tokens = new Map();
    
    // Initialize with some mock users for leaderboard and tokens
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
      const id = randomUUID();
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
        rewardAmount: 50000000000000 // 0.00005 tokens
      },
      {
        address: "0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3",
        symbol: "TOKEN2", 
        name: "Second Token",
        decimals: 18,
        isActive: true,
        rewardAmount: 100000000000000 // 0.0001 tokens
      },
      {
        address: "0xbc4c97fb9befaa8b41448e1dfcc5236da543217f",
        symbol: "TOKEN3",
        name: "Third Token", 
        decimals: 18,
        isActive: true,
        rewardAmount: 25000000000000 // 0.000025 tokens
      }
    ];

    tokensData.forEach(tokenData => {
      const id = randomUUID();
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
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = randomUUID();
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
    const id = randomUUID();
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
    
    // Check if last spin was today (UTC)
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
    const id = randomUUID();
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

export const storage = new MemStorage();