import { createLogger } from "../../_core/logger";
const log = createLogger("analytics-repo");
/**
 * Analytics Module - Database Repository
 * Handles filters, analytics reports, and statistics
 */
import { eq, desc, and, gte, lte, between } from "drizzle-orm";
import { reviews, vendorRatingSummary } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";

export async function getFilteredTechnicianStats(filters: {
  startDate?: Date;
  endDate?: Date;
  technicianId?: number;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
  sortBy?: 'rating' | 'jobs' | 'reviews' | 'name';
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions: any[] = [];
    if (filters.startDate) conditions.push(gte(reviews.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(reviews.createdAt, filters.endDate));
    if (filters.minRating || filters.maxRating) {
      conditions.push(between(reviews.rating, filters.minRating || 1, filters.maxRating || 5));
    }

    let query: any = db.select().from(reviews);
    if (conditions.length > 0) query = query.where(and(...conditions));
    query = query.where(eq(reviews.approved, 1));

    let orderByClause: any = desc(reviews.rating);
    if (filters.sortBy === 'jobs' || filters.sortBy === 'reviews') orderByClause = desc(reviews.createdAt);
    else if (filters.sortBy === 'name') orderByClause = desc(reviews.name);

    const results = await query.orderBy(orderByClause);

    const statsMap = new Map<number, any>();
    for (const review of results) {
      const techId = 0;
      if (!statsMap.has(techId)) {
        statsMap.set(techId, { technicianId: techId, reviews: [], totalReviews: 0, averageRating: 0, fiveStarCount: 0, fourStarCount: 0, threeStarCount: 0, twoStarCount: 0, oneStarCount: 0 });
      }
      const stats = statsMap.get(techId)!;
      stats.reviews.push(review);
      stats.totalReviews++;
      if (review.rating === 5) stats.fiveStarCount++;
      else if (review.rating === 4) stats.fourStarCount++;
      else if (review.rating === 3) stats.threeStarCount++;
      else if (review.rating === 2) stats.twoStarCount++;
      else if (review.rating === 1) stats.oneStarCount++;
    }

    return Array.from(statsMap.values())
      .filter(s => s.totalReviews >= (filters.minReviews || 0))
      .map(s => ({ ...s, averageRating: s.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / s.totalReviews }));
  } catch (error) {
    log.error("Error fetching filtered technician stats:", error);
    return [];
  }
}

export async function getAnalyticsReport(filters: {
  startDate?: Date;
  endDate?: Date;
  technicianId?: number;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const filteredStats = await getFilteredTechnicianStats(filters);
    if (filteredStats.length === 0) return { totalTechnicians: 0, totalReviews: 0, averageRating: 0, technicians: [] };

    const totalReviews = filteredStats.reduce((sum: number, s: any) => sum + s.totalReviews, 0);
    const averageRating = filteredStats.reduce((sum: number, s: any) => sum + s.averageRating, 0) / filteredStats.length;

    return { totalTechnicians: filteredStats.length, totalReviews, averageRating, technicians: filteredStats };
  } catch (error) {
    log.error("Error generating analytics report:", error);
    return null;
  }
}

// Saved Filters
export async function saveTechnicianFilter(userId: number, filterData: {
  name: string; description?: string; startDate?: Date; endDate?: Date;
  technicianId?: number; minRating?: number; maxRating?: number;
  minReviews?: number; sortBy?: 'rating' | 'jobs' | 'reviews' | 'name'; isDefault?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    return await db.insert(savedFilters).values({
      userId, name: filterData.name, description: filterData.description,
      startDate: filterData.startDate, endDate: filterData.endDate,
      technicianId: filterData.technicianId,
      minRating: filterData.minRating ? filterData.minRating.toString() : "1",
      maxRating: filterData.maxRating ? filterData.maxRating.toString() : "5",
      minReviews: filterData.minReviews || 0,
      sortBy: filterData.sortBy || 'rating',
      isDefault: filterData.isDefault || false,
    });
  } catch (error) {
    log.error("Error saving filter:", error);
    return null;
  }
}

export async function getSavedFilters(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    return await db.select().from(savedFilters).where(eq(savedFilters.userId, userId)).orderBy(desc(savedFilters.lastUsedAt), desc(savedFilters.createdAt));
  } catch (error) {
    log.error("Error fetching saved filters:", error);
    return [];
  }
}

export async function getSavedFilterById(filterId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    const result = await db.select().from(savedFilters).where(and(eq(savedFilters.id, filterId), eq(savedFilters.userId, userId))).limit(1);
    return result[0] || null;
  } catch (error) {
    log.error("Error fetching saved filter:", error);
    return null;
  }
}

export async function updateSavedFilter(filterId: number, userId: number, filterData: {
  name?: string; description?: string; startDate?: Date; endDate?: Date;
  technicianId?: number; minRating?: number; maxRating?: number;
  minReviews?: number; sortBy?: 'rating' | 'jobs' | 'reviews' | 'name'; isDefault?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    const updateData: any = { updatedAt: new Date() };
    if (filterData.name) updateData.name = filterData.name;
    if (filterData.description !== undefined) updateData.description = filterData.description;
    if (filterData.startDate !== undefined) updateData.startDate = filterData.startDate;
    if (filterData.endDate !== undefined) updateData.endDate = filterData.endDate;
    if (filterData.technicianId !== undefined) updateData.technicianId = filterData.technicianId;
    if (filterData.minRating !== undefined) updateData.minRating = filterData.minRating.toString();
    if (filterData.maxRating !== undefined) updateData.maxRating = filterData.maxRating.toString();
    if (filterData.minReviews !== undefined) updateData.minReviews = filterData.minReviews;
    if (filterData.sortBy !== undefined) updateData.sortBy = filterData.sortBy;
    if (filterData.isDefault !== undefined) updateData.isDefault = filterData.isDefault;

    return await db.update(savedFilters).set(updateData).where(and(eq(savedFilters.id, filterId), eq(savedFilters.userId, userId)));
  } catch (error) {
    log.error("Error updating saved filter:", error);
    return null;
  }
}

export async function deleteSavedFilter(filterId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    await db.delete(savedFilters).where(and(eq(savedFilters.id, filterId), eq(savedFilters.userId, userId)));
    return true;
  } catch (error) {
    log.error("Error deleting saved filter:", error);
    return false;
  }
}

export async function updateFilterUsageCount(filterId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    return await db.update(savedFilters).set({
      usageCount: (await db.select().from(savedFilters).where(eq(savedFilters.id, filterId)))[0]?.usageCount + 1 || 1,
      lastUsedAt: new Date(),
    }).where(eq(savedFilters.id, filterId));
  } catch (error) {
    log.error("Error updating filter usage count:", error);
    return null;
  }
}

export async function setDefaultFilter(filterId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    await db.update(savedFilters).set({ isDefault: false }).where(eq(savedFilters.userId, userId));
    return await db.update(savedFilters).set({ isDefault: true }).where(and(eq(savedFilters.id, filterId), eq(savedFilters.userId, userId)));
  } catch (error) {
    log.error("Error setting default filter:", error);
    return null;
  }
}

export async function getDefaultFilter(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { savedFilters } = await import("../../../drizzle/schema");
    const result = await db.select().from(savedFilters).where(and(eq(savedFilters.userId, userId), eq(savedFilters.isDefault, true))).limit(1);
    return result[0] || null;
  } catch (error) {
    log.error("Error fetching default filter:", error);
    return null;
  }
}
