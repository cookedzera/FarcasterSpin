import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only create database connection if DATABASE_URL is available
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.log('🧪 DATABASE_URL not set, database connection will be skipped');
}

export { pool, db };