import { createLogger } from "../../_core/logger";
const log = createLogger("gamification-repo");
/**
 * Gamification Module - Badges, Rewards, Leaderboard
 */
import { eq, desc, and, gte } from "drizzle-orm";
import { technicians, bookings, reviews } from "../../../drizzle/schema";
import { getDb } from "../../shared/database";
import { getTechnicianStats } from "../technicians/repository";

export async function getTechnicianBadges(technicianId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { technicianBadges, badges } = await import("../../../drizzle/schema");
    return await db.select({
      id: technicianBadges.id, badgeId: technicianBadges.badgeId,
      name: badges.name, description: badges.description, icon: badges.icon,
      color: badges.color, type: badges.type, rarity: badges.rarity,
      earnedAt: technicianBadges.earnedAt, expiresAt: technicianBadges.expiresAt,
      isPinned: technicianBadges.isPinned,
    }).from(technicianBadges)
      .innerJoin(badges, eq(technicianBadges.badgeId, badges.id))
      .where(eq(technicianBadges.technicianId, technicianId))
      .orderBy(desc(technicianBadges.isPinned), desc(technicianBadges.earnedAt));
  } catch (error) {
    log.error("Error fetching technician badges:", error);
    return [];
  }
}

export async function awardBadgeToTechnician(technicianId: number, badgeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { technicianBadges } = await import("../../../drizzle/schema");
    return await db.insert(technicianBadges).values({ technicianId, badgeId, earnedAt: new Date() });
  } catch (error) {
    log.error("Error awarding badge:", error);
    return null;
  }
}

export async function getTechnicianRewards(technicianId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { technicianRewards, rewards } = await import("../../../drizzle/schema");
    const now = new Date();
    return await db.select({
      id: technicianRewards.id, rewardId: technicianRewards.rewardId,
      name: rewards.name, description: rewards.description, icon: rewards.icon,
      type: rewards.type, value: rewards.value, percentage: rewards.percentage,
      status: technicianRewards.status, earnedAt: technicianRewards.earnedAt,
      expiresAt: technicianRewards.expiresAt, usedAt: technicianRewards.usedAt,
    }).from(technicianRewards)
      .innerJoin(rewards, eq(technicianRewards.rewardId, rewards.id))
      .where(and(eq(technicianRewards.technicianId, technicianId), gte(rewards.validUntil || new Date(2099, 12, 31), now)))
      .orderBy(desc(technicianRewards.earnedAt));
  } catch (error) {
    log.error("Error fetching technician rewards:", error);
    return [];
  }
}

export async function awardRewardToTechnician(technicianId: number, rewardId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { technicianRewards } = await import("../../../drizzle/schema");
    return await db.insert(technicianRewards).values({ technicianId, rewardId, status: "pending", earnedAt: new Date() });
  } catch (error) {
    log.error("Error awarding reward:", error);
    return null;
  }
}

export async function getTechnicianLeaderboardPosition(technicianId: number, period: "weekly" | "monthly" | "yearly" | "all_time" = "monthly") {
  const db = await getDb();
  if (!db) return null;

  try {
    const { leaderboard } = await import("../../../drizzle/schema");
    const result = await db.select().from(leaderboard).where(and(eq(leaderboard.technicianId, technicianId), eq(leaderboard.period, period))).limit(1);
    return result[0] || null;
  } catch (error) {
    log.error("Error fetching leaderboard position:", error);
    return null;
  }
}

export async function getTopTechniciansLeaderboard(period: "weekly" | "monthly" | "yearly" | "all_time" = "monthly", limit = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { leaderboard, technicians } = await import("../../../drizzle/schema");
    return await db.select({
      rank: leaderboard.rank, technicianId: leaderboard.technicianId,
      name: technicians.name, ratingScore: leaderboard.ratingScore,
      jobsScore: leaderboard.jobsScore, reviewsScore: leaderboard.reviewsScore,
      totalScore: leaderboard.totalScore,
    }).from(leaderboard)
      .innerJoin(technicians, eq(leaderboard.technicianId, technicians.id))
      .where(eq(leaderboard.period, period))
      .orderBy(desc(leaderboard.totalScore))
      .limit(limit);
  } catch (error) {
    log.error("Error fetching leaderboard:", error);
    return [];
  }
}

export async function checkAndAwardBadges(technicianId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const stats = await getTechnicianStats(technicianId);
    if (!stats) return [];

    const { badges, technicianBadges } = await import("../../../drizzle/schema");
    const allBadges = await db.select().from(badges).where(eq(badges.isActive, true));
    const awardedBadges = [];

    for (const badge of allBadges) {
      const existing = await db.select().from(technicianBadges)
        .where(and(eq(technicianBadges.technicianId, technicianId), eq(technicianBadges.badgeId, badge.id))).limit(1);
      if (existing.length > 0) continue;

      let shouldAward = false;
      switch (badge.type) {
        case "rating": if (badge.minRating && stats.averageRating >= parseFloat(badge.minRating.toString())) shouldAward = true; break;
        case "jobs": if (badge.minJobs && stats.completedJobs >= badge.minJobs) shouldAward = true; break;
        case "reviews": if (badge.minReviews && stats.reviewCount >= badge.minReviews) shouldAward = true; break;
      }

      if (shouldAward) {
        await awardBadgeToTechnician(technicianId, badge.id);
        awardedBadges.push(badge);
      }
    }
    return awardedBadges;
  } catch (error) {
    log.error("Error checking and awarding badges:", error);
    return [];
  }
}

export async function updateLeaderboard() {
  const db = await getDb();
  if (!db) return false;

  try {
    const { leaderboard } = await import("../../../drizzle/schema");
    const allTechnicians = await db.select().from(technicians);

    for (const technician of allTechnicians) {
      const stats = await getTechnicianStats(technician.id);
      if (!stats) continue;

      const ratingScore = stats.averageRating * 20;
      const jobsScore = Math.min(stats.completedJobs, 100);
      const reviewsScore = Math.min(stats.reviewCount * 2, 100);
      const totalScore = (ratingScore + jobsScore + reviewsScore) / 3;

      const existing = await db.select().from(leaderboard).where(eq(leaderboard.technicianId, technician.id)).limit(1);
      if (existing.length > 0) {
        await db.update(leaderboard).set({ ratingScore: ratingScore.toString(), jobsScore, reviewsScore, totalScore: totalScore.toString(), updatedAt: new Date() }).where(eq(leaderboard.technicianId, technician.id));
      } else {
        await db.insert(leaderboard).values({ technicianId: technician.id, ratingScore: ratingScore.toString(), jobsScore, reviewsScore, totalScore: totalScore.toString(), rank: 0, period: "monthly" });
      }
    }

    const entries = await db.select().from(leaderboard).orderBy(desc(leaderboard.totalScore));
    for (let i = 0; i < entries.length; i++) {
      await db.update(leaderboard).set({ rank: i + 1 }).where(eq(leaderboard.id, entries[i].id));
    }
    return true;
  } catch (error) {
    log.error("Error updating leaderboard:", error);
    return false;
  }
}
