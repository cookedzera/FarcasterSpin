import { type User, type InsertUser, type GameStats, type InsertGameStats, type SpinResult, type InsertSpinResult } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameStats: GameStats;
  private spinResults: Map<string, SpinResult>;

  constructor() {
    this.users = new Map();
    this.gameStats = {
      id: randomUUID(),
      date: new Date(),
      totalClaims: 1024,
      contractTxs: 839,
    };
    this.spinResults = new Map();
    
    // Initialize with some mock users for leaderboard
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockUsers = [
      { username: "0xAb...C1F", walletAddress: "0xAb...C1F", spinsUsed: 2, totalWins: 4, totalSpins: 4 },
      { username: "0xD2...B12", walletAddress: "0xD2...B12", spinsUsed: 2, totalWins: 3, totalSpins: 5 },
      { username: "0xE3...A45", walletAddress: "0xE3...A45", spinsUsed: 1, totalWins: 2, totalSpins: 3 },
      { username: "0xF4...B67", walletAddress: "0xF4...B67", spinsUsed: 2, totalWins: 2, totalSpins: 4 },
      { username: "0xG5...C89", walletAddress: "0xG5...C89", spinsUsed: 1, totalWins: 1, totalSpins: 2 },
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
}

export const storage = new MemStorage();
