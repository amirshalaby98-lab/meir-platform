/**
 * Contacts Module - Database Repository
 */
import { contactMessages, InsertContactMessage } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(contactMessages).values(message);
}

export async function getAllContactMessages() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
}
