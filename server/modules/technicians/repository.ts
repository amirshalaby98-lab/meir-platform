import { createLogger } from "../../_core/logger";
const log = createLogger("technicians-repo");
/**
 * Technicians Module - Database Repository
 */
import { eq, desc, and } from "drizzle-orm";
import { technicians, InsertTechnician, bookings, reviews, vendorRatingSummary } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";

export async function getAllTechnicians() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(technicians).orderBy(technicians.createdAt);
}

export async function getTechnicianById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(technicians).where(eq(technicians.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAvailableTechnicians(location: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(technicians).where(eq(technicians.location, location));
}

export async function createTechnician(data: InsertTechnician) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(technicians).values(data);
}

export async function updateTechnicianStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(technicians).set({ status: status as any }).where(eq(technicians.id, id));
}

export async function updateTechnicianInfo(id: number, data: { specialty?: string; location?: string; name?: string; phone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = {};
  if (data.specialty) updateData.specialty = data.specialty;
  if (data.location) updateData.location = data.location;
  if (data.name) updateData.name = data.name;
  if (data.phone) updateData.phone = data.phone;
  await db.update(technicians).set(updateData).where(eq(technicians.id, id));
}

export async function assignTechnicianToBooking(bookingId: number, technicianId: number, technicianName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ technicianId, technicianName }).where(eq(bookings.id, bookingId));
}

export async function getTechnicianBookings(technicianId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(bookings).where(eq(bookings.technicianId, technicianId)).orderBy(bookings.createdAt);
}

export async function getTechnicianStats(technicianId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const technician = await db.select().from(technicians).where(eq(technicians.id, technicianId)).limit(1);
    if (!technician.length) return null;

    const technicianReviews = await db.select().from(reviews).where(eq(reviews.approved, 1));
    const totalReviews = technicianReviews.length;
    const averageRating = totalReviews > 0
      ? technicianReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;

    const completedJobs = await db.select().from(bookings).where(eq(bookings.technicianId, technician[0].id));
    const successfulJobs = completedJobs.filter(b => b.status === 'completed').length;
    const successRate = completedJobs.length > 0 ? Math.round((successfulJobs / completedJobs.length) * 100) : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = technicianReviews.filter(r => r.createdAt && new Date(r.createdAt) > thirtyDaysAgo).length;

    return {
      totalRating: averageRating,
      reviewCount: totalReviews,
      averageRating,
      completedJobs: successfulJobs,
      successRate,
      qualityRating: averageRating,
      priceRating: averageRating,
      serviceRating: averageRating,
      recentReviews,
      trend: 'stable' as const,
      trendPercentage: 0,
    };
  } catch (error) {
    log.error("Error fetching technician stats:", error);
    return null;
  }
}

export async function getTechnicianReviews(technicianId: number, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    const technician = await db.select().from(technicians).where(eq(technicians.id, technicianId)).limit(1);
    if (!technician.length) return [];

    return await db.select().from(reviews)
      .where(eq(reviews.approved, 1))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    log.error("Error fetching technician reviews:", error);
    return [];
  }
}

export async function getTechnicianReviewsCount(technicianId: number) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.select().from(reviews).where(eq(reviews.approved, 1));
    return result.length;
  } catch (error) {
    log.error("Error counting technician reviews:", error);
    return 0;
  }
}

export async function getTechnicianCompletedBookings(technicianId: number, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(bookings)
      .where(eq(bookings.technicianId, technicianId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    log.error("Error fetching technician bookings:", error);
    return [];
  }
}

export async function getTechnicianMonthlyStats(technicianId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const technician = await db.select().from(technicians).where(eq(technicians.id, technicianId)).limit(1);
    if (!technician.length) return null;

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const monthlyReviews = await db.select().from(reviews).where(eq(reviews.approved, 1));
    const thisMonthReviews = monthlyReviews.filter(r => r.createdAt && new Date(r.createdAt) > monthAgo);
    const previousMonthReviews = monthlyReviews.filter(r => r.createdAt && new Date(r.createdAt) <= monthAgo);

    const thisMonthAverage = thisMonthReviews.length > 0
      ? thisMonthReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / thisMonthReviews.length : 0;
    const previousMonthAverage = previousMonthReviews.length > 0
      ? previousMonthReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / previousMonthReviews.length : 0;

    const trend = thisMonthAverage > previousMonthAverage ? 'up' : thisMonthAverage < previousMonthAverage ? 'down' : 'stable';
    const trendPercentage = previousMonthAverage > 0 ? Math.round(((thisMonthAverage - previousMonthAverage) / previousMonthAverage) * 100) : 0;

    return { thisMonth: thisMonthAverage, previousMonth: previousMonthAverage, trend, trendPercentage, reviewsThisMonth: thisMonthReviews.length, reviewsPreviousMonth: previousMonthReviews.length };
  } catch (error) {
    log.error("Error fetching technician monthly stats:", error);
    return null;
  }
}

export async function getTechnicianRatingDistribution(technicianId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const technician = await db.select().from(technicians).where(eq(technicians.id, technicianId)).limit(1);
    if (!technician.length) return [];

    const allReviews = await db.select().from(reviews).where(eq(reviews.approved, 1));
    return [1, 2, 3, 4, 5].map(rating => {
      const count = allReviews.filter(r => Math.round(r.rating || 0) === rating).length;
      return {
        rating, count,
        percentage: allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0,
        color: rating <= 2 ? '#ef4444' : rating === 3 ? '#f59e0b' : '#10b981',
      };
    });
  } catch (error) {
    log.error("Error fetching rating distribution:", error);
    return [];
  }
}

export async function registerTechnician(data: {
  userId: number;
  name: string;
  phone: string;
  email?: string;
  nationalId: string;
  specialization: string;
  yearsExperience: number;
  location: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(technicians).values({
    ...data,
    status: "offline",
    approvalStatus: "pending",
  });
}

export async function getTechnicianByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(technicians).where(eq(technicians.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPendingTechnicians() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(technicians).where(eq(technicians.approvalStatus, "pending")).orderBy(desc(technicians.createdAt));
}

export async function approveTechnician(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(technicians).set({ approvalStatus: "approved" as any, status: "available" }).where(eq(technicians.id, id));
}

export async function rejectTechnician(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(technicians).set({ approvalStatus: "rejected" as any }).where(eq(technicians.id, id));
}

export async function getTechnicianRatingSummary(technicianId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(vendorRatingSummary).where(eq(vendorRatingSummary.vendorId, technicianId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    log.error("Error fetching technician rating summary:", error);
    return null;
  }
}
