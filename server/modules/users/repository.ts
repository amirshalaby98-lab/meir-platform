import { createLogger } from "../../_core/logger";
const log = createLogger("users-repo");
/**
 * Users Module - Database Repository
 */
import { eq, and, isNull, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { users, passwordResetCodes, InsertUser } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";
import { ENV } from "../../_core/env";

function generateOtpCode(): string {
  return Math.random().toString().slice(2, 8).padStart(6, "0");
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    log.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    log.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    log.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(users).orderBy(users.createdAt);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(id: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role: role as any }).where(eq(users.id, id));
}

export async function toggleUserActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ isActive }).where(eq(users.id, id));
}

export async function setUserType(id: number, userType: "customer" | "technician" | "service_provider") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ userType }).where(eq(users.id, id));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a locally-authenticated (email/password) user account.
 * Synthesizes an openId so it fits the same session/lookup mechanism used
 * for Manus-OAuth-origin accounts, without ever calling out to Manus.
 */
export async function createLocalUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const openId = `local:${nanoid()}`;

  await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    loginMethod: "password",
    lastSignedIn: new Date(),
  });

  return getUserByOpenId(openId);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Strip the password hash before a user row is sent to the client. */
export function toSafeUser<T extends { passwordHash?: string | null }>(
  user: T
): Omit<T, "passwordHash"> {
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * Generate and store a password-reset OTP for a user. Valid for 10 minutes.
 * Returns the plain code (caller is responsible for delivering it).
 */
export async function createPasswordResetCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(passwordResetCodes).values({ userId, code, expiresAt });

  return code;
}

/**
 * Validate a password-reset OTP and mark it used if valid.
 * Returns true if the code was valid (unused, unexpired, matching userId).
 */
export async function consumePasswordResetCode(userId: number, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const matches = await db
    .select()
    .from(passwordResetCodes)
    .where(
      and(
        eq(passwordResetCodes.userId, userId),
        eq(passwordResetCodes.code, code),
        isNull(passwordResetCodes.usedAt),
        gt(passwordResetCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (matches.length === 0) return false;

  await db
    .update(passwordResetCodes)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetCodes.id, matches[0].id));

  return true;
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}
