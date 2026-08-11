/**
 * Shared database connection utility
 * All modules should import getDb from here
 */
import { drizzle } from "drizzle-orm/mysql2";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      // @ts-ignore
      // Database connection warning is expected during startup;
      _db = null;
    }
  }
  return _db;
}
