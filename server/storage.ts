import { type User, type InsertUser, type GameStats, type InsertGameStats, type SpinResult, type InsertSpinResult, type Token, type InsertToken } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getGameStats(): Promise<GameStats>;
  updateGameStats(updates: Partial<GameStats>): Promise<GameStats>;
  createSpinResult(result: InsertSpinResult): Promise<SpinResult>;
  getLeaderboard(): Promise<User[]>;
  getUserSpinsToday(userId: string): Promise<number>;
  getTokens(): Promise<Token[]>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(id: string, updates: Partial<Token>): Promise<Token | undefined>;
  getActiveTokens(): Promise<Token[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameStats: GameStats;
  private spinResults: Map<string, SpinResult>;
  private tokens: Map<string, Token>;

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

  private initializeMockData() {
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
      const fullUser: User = {
        id,
        ...user,
        lastSpinDate: new Date(),
        createdAt: new Date(),
      };
      this.users.set(id, fullUser);
    });
  }

  private initializeTokens() {
    const tokensData = [
      {
        address: "0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b",
        symbol: "TOKEN1",
        name: "First Token",
        decimals: 18,
        isActive: true,
        rewardAmount: 50000000000000 // 0.00005 tokens (very small amount)
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
      const token: Token = {
        id,
        ...tokenData,
      };
      this.tokens.set(id, token);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
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

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getGameStats(): Promise<GameStats> {
    return this.gameStats;
  }

  async updateGameStats(updates: Partial<GameStats>): Promise<GameStats> {
    this.gameStats = { ...this.gameStats, ...updates };
    return this.gameStats;
  }

  async createSpinResult(result: InsertSpinResult): Promise<SpinResult> {
    const id = randomUUID();
    const spinResult: SpinResult = {
      ...result,
      id,
      timestamp: new Date(),
    };
    this.spinResults.set(id, spinResult);
    return spinResult;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalWins - a.totalWins)
      .slice(0, 10);
  }

  async getUserSpinsToday(userId: string): Promise<number> {
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

  async getTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = randomUUID();
    const token: Token = {
      ...insertToken,
      id,
    };
    this.tokens.set(id, token);
    return token;
  }

  async updateToken(id: string, updates: Partial<Token>): Promise<Token | undefined> {
    const token = this.tokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  async getActiveTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(token => token.isActive);
  }
}

export const storage = new MemStorage();
