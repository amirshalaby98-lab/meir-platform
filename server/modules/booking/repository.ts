import { createLogger } from "../../_core/logger";
const log = createLogger("booking-repo");
/**
 * Booking Module - Database Repository
 */
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";
import { bookings, InsertBooking } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookings).values(booking);
  const insertId = Number(result[0].insertId);
  return { id: insertId, ...booking };
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(bookings).orderBy(bookings.createdAt);
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateBookingStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, id));
}

export async function getBookingsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(bookings)
    .where(and(gte(bookings.createdAt, startDate), lte(bookings.createdAt, endDate)))
    .orderBy(bookings.createdAt);
}

export async function markReviewAsSent(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ reviewSent: 1 }).where(eq(bookings.id, bookingId));
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bookings).where(eq(bookings.id, id));
}

export async function deleteMultipleBookings(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  await db.delete(bookings).where(inArray(bookings.id, ids));
}

export async function getCompletedBookingsForReview(customerId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(bookings)
      .where(eq(bookings.status, 'completed'))
      .orderBy(desc(bookings.updatedAt));
  } catch (error) {
    log.error("Error fetching completed bookings:", error);
    return [];
  }
}
