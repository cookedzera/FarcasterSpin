import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  walletAddress: text("wallet_address"),
  spinsUsed: integer("spins_used").default(0),
  totalWins: integer("total_wins").default(0),
  totalSpins: integer("total_spins").default(0),
  lastSpinDate: timestamp("last_spin_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").default(sql`now()`),
  totalClaims: integer("total_claims").default(0),
  contractTxs: integer("contract_txs").default(0),
});

export const spinResults = pgTable("spin_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symbols: jsonb("symbols").$type<string[]>(),
  isWin: boolean("is_win").default(false),
  rewardAmount: integer("reward_amount").default(0),
  rewardToken: text("reward_token").default("PEPE"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  date: true,
});

export const insertSpinResultSchema = createInsertSchema(spinResults).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;
export type InsertSpinResult = z.infer<typeof insertSpinResultSchema>;
export type SpinResult = typeof spinResults.$inferSelect;
