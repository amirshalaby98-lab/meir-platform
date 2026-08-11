import { createLogger } from "../../_core/logger";
const log = createLogger("reviews-repo");
/**
 * Reviews Module - Database Repository
 */
import { eq, desc, and, gte, lte, between } from "drizzle-orm";
import { reviews, InsertReview, vendorRatingSummary } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(reviews).values(review);
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(reviews).orderBy(reviews.createdAt);
}

export async function getApprovedReviews() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(reviews).where(eq(reviews.approved, 1)).orderBy(desc(reviews.createdAt));
  } catch (error) {
    log.error("Error fetching approved reviews:", error);
    return [];
  }
}

export async function updateReviewApproval(id: number, approved: boolean | number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const approvedNum = typeof approved === 'boolean' ? (approved ? 1 : 0) : approved;
  await db.update(reviews).set({ approved: approvedNum }).where(eq(reviews.id, id));
}

export async function submitReview(reviewData: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db.insert(reviews).values(reviewData);
  } catch (error) {
    log.error("Error submitting review:", error);
    throw error;
  }
}

export async function getReviewsByTechnician(technicianId: number, sort: 'recent' | 'rating' | 'helpful' = 'recent') {
  const db = await getDb();
  if (!db) return [];

  try {
    let orderByClause: any = desc(reviews.createdAt);
    if (sort === 'rating') orderByClause = desc(reviews.rating);
    return await db.select().from(reviews).where(eq(reviews.approved, 1)).orderBy(orderByClause);
  } catch (error) {
    log.error("Error fetching technician reviews:", error);
    return [];
  }
}

export async function getReviewsByDateRange(startDate: Date, endDate: Date, technicianId?: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions: any[] = [gte(reviews.createdAt, startDate), lte(reviews.createdAt, endDate), eq(reviews.approved, 1)];
    return await db.select().from(reviews).where(and(...conditions)).orderBy(desc(reviews.createdAt));
  } catch (error) {
    log.error("Error fetching reviews by date range:", error);
    return [];
  }
}

export async function updateVendorRatingSummary(vendorId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const vendorReviews = await db.select().from(reviews).where(eq(reviews.approved, 1));
    if (vendorReviews.length === 0) return;

    const totalReviews = vendorReviews.length;
    const averageRating = vendorReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews;
    const starCounts = {
      fiveStarCount: vendorReviews.filter((r: any) => r.rating === 5).length,
      fourStarCount: vendorReviews.filter((r: any) => r.rating === 4).length,
      threeStarCount: vendorReviews.filter((r: any) => r.rating === 3).length,
      twoStarCount: vendorReviews.filter((r: any) => r.rating === 2).length,
      oneStarCount: vendorReviews.filter((r: any) => r.rating === 1).length,
    };
    const recommendationPercentage = ((starCounts.fiveStarCount + starCounts.fourStarCount) / totalReviews) * 100;

    const existing = await db.select().from(vendorRatingSummary).where(eq(vendorRatingSummary.vendorId, vendorId));
    if (existing.length > 0) {
      await db.update(vendorRatingSummary).set({ averageRating: averageRating.toString() as any, totalReviews, ...starCounts, recommendationPercentage: recommendationPercentage.toString() as any }).where(eq(vendorRatingSummary.vendorId, vendorId));
    } else {
      await db.insert(vendorRatingSummary).values({ vendorId, averageRating: averageRating.toString() as any, totalReviews, ...starCounts, recommendationPercentage: recommendationPercentage.toString() as any });
    }
  } catch (error) {
    log.error("Error updating vendor rating summary:", error);
  }
}

export async function markReviewHelpful(reviewId: number) {
  log.info(`Review ${reviewId} marked as helpful`);
}

export async function markReviewUnhelpful(reviewId: number) {
  log.info(`Review ${reviewId} marked as unhelpful`);
}

export async function getTechniciansByRatingRange(minRating: number, maxRating: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(vendorRatingSummary)
      .where(and(gte(vendorRatingSummary.averageRating as any, minRating.toString()), lte(vendorRatingSummary.averageRating as any, maxRating.toString())))
      .orderBy(desc(vendorRatingSummary.averageRating));
  } catch (error) {
    log.error("Error fetching technicians by rating range:", error);
    return [];
  }
}
