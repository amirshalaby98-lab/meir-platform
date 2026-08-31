import { z } from "zod";
import { adminProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import {
  users,
  contactMessages,
  reviews,
  loyaltyPoints,
  courses,
} from "../../../drizzle/schema";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";

export const adminDashboardRouter = router({
  /**
   * الحصول على ملخص شامل للمنصة
   * يشمل: إجمالي المستخدمين، الإيرادات، التقييمات
   */
  getPlatformSummary: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // إجمالي المستخدمين
    const totalUsersResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // المستخدمين الجدد هذا الأسبوع
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.createdAt, weekAgo));
    const newUsersThisWeek = newUsersResult[0]?.count || 0;

    // إجمالي التقييمات
    const totalReviewsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reviews);
    const totalReviews = totalReviewsResult[0]?.count || 0;

    // التقييمات المعلقة
    const pendingReviewsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reviews)
      .where(eq(reviews.approved, 0));
    const pendingReviews = pendingReviewsResult[0]?.count || 0;

    // متوسط التقييم
    const avgRatingResult = await db
      .select({ avg: sql<string>`COALESCE(AVG(rating), 0)` })
      .from(reviews)
      .where(eq(reviews.approved, 1));
    const averageRating = parseFloat(avgRatingResult[0]?.avg || "0");

    // الرسائل غير المقروءة
    const unreadMessagesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(contactMessages)
      .where(eq(contactMessages.read, 0));
    const unreadMessages = unreadMessagesResult[0]?.count || 0;

    // إجمالي نقاط الولاء الموزعة
    const totalPointsResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(totalEarned), 0)` })
      .from(loyaltyPoints);
    const totalLoyaltyPoints = totalPointsResult[0]?.sum || 0;

    // إجمالي الدورات
    const totalCoursesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(courses);
    const totalCourses = totalCoursesResult[0]?.count || 0;

    return {
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
      },
      reviews: {
        total: totalReviews,
        pending: pendingReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      messages: {
        unread: unreadMessages,
      },
      loyalty: {
        totalPoints: totalLoyaltyPoints,
      },
      courses: {
        total: totalCourses,
      },
    };
  }),

  /**
   * نشاط المستخدمين الأخير - آخر تسجيلات الدخول
   */
  getRecentUserActivity: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const limit = input?.limit || 20;

      const recentUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          loginMethod: users.loginMethod,
          lastSignedIn: users.lastSignedIn,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.lastSignedIn))
        .limit(limit);

      return recentUsers;
    }),

  /**
   * إحصائيات المحتوى - التقييمات والرسائل
   */
  getContentStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // آخر التقييمات المعلقة
    const pendingReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, 0))
      .orderBy(desc(reviews.createdAt))
      .limit(10);

    // آخر الرسائل غير المقروءة
    const unreadMessages = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.read, 0))
      .orderBy(desc(contactMessages.createdAt))
      .limit(10);

    // توزيع التقييمات (1-5 نجوم)
    const ratingDistribution = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.approved, 1))
      .groupBy(reviews.rating)
      .orderBy(reviews.rating);

    return {
      pendingReviews,
      unreadMessages,
      ratingDistribution,
    };
  }),

  /**
   * إحصائيات المستخدمين الجدد حسب الفترة
   */
  getUserGrowth: adminProcedure
    .input(
      z.object({
        period: z.enum(["7days", "30days", "90days"]).default("30days"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const period = input?.period || "30days";

      const days = period === "7days" ? 7 : period === "30days" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const userGrowth = await db
        .select({
          date: sql<string>`DATE(createdAt)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(users)
        .where(gte(users.createdAt, startDate))
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return userGrowth;
    }),

  /**
   * تنبيهات: تقييمات سلبية حديثة
   */
  getAlerts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // تقييمات سلبية حديثة (1-2 نجوم)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const negativeReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          lte(reviews.rating, 2),
          gte(reviews.createdAt, weekAgo)
        )
      )
      .orderBy(desc(reviews.createdAt))
      .limit(5);

    return {
      negativeReviews,
      alertsCount: negativeReviews.length,
    };
  }),
});
