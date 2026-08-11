import { z } from "zod";
import { adminProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import {
  users,
  bookings,
  contactMessages,
  technicians,
  reviews,
  loyaltyPoints,
  courses,
  enrollments,
} from "../../../drizzle/schema";
import { eq, desc, sql, gte, lte, and, count } from "drizzle-orm";

export const adminDashboardRouter = router({
  /**
   * الحصول على ملخص شامل للمنصة
   * يشمل: إجمالي المستخدمين، الحجوزات، الإيرادات، الفنيين، التقييمات
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

    // إجمالي الحجوزات
    const totalBookingsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings);
    const totalBookings = totalBookingsResult[0]?.count || 0;

    // حجوزات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookingsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(gte(bookings.createdAt, today));
    const todayBookings = todayBookingsResult[0]?.count || 0;

    // الحجوزات المعلقة
    const pendingBookingsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(eq(bookings.status, "pending"));
    const pendingBookings = pendingBookingsResult[0]?.count || 0;

    // الحجوزات المكتملة
    const completedBookingsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(eq(bookings.status, "completed"));
    const completedBookings = completedBookingsResult[0]?.count || 0;

    // إجمالي الفنيين
    const totalTechniciansResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(technicians);
    const totalTechnicians = totalTechniciansResult[0]?.count || 0;

    // الفنيين المتاحين
    const availableTechniciansResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(technicians)
      .where(eq(technicians.status, "available"));
    const availableTechnicians = availableTechniciansResult[0]?.count || 0;

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
      bookings: {
        total: totalBookings,
        today: todayBookings,
        pending: pendingBookings,
        completed: completedBookings,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      },
      technicians: {
        total: totalTechnicians,
        available: availableTechnicians,
        busy: totalTechnicians - availableTechnicians,
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
   * إحصائيات الحجوزات حسب الفترة الزمنية
   */
  getBookingsTrend: adminProcedure
    .input(
      z.object({
        period: z.enum(["7days", "30days", "90days"]).default("7days"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const period = input?.period || "7days";

      const days = period === "7days" ? 7 : period === "30days" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const bookingsData = await db
        .select({
          date: sql<string>`DATE(createdAt)`,
          count: sql<number>`COUNT(*)`,
          pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
          confirmed: sql<number>`SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)`,
          completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
          cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
        })
        .from(bookings)
        .where(gte(bookings.createdAt, startDate))
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return bookingsData;
    }),

  /**
   * أداء الفنيين - ترتيب حسب الإنجاز والتقييم
   */
  getTechnicianPerformance: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const techPerformance = await db
      .select({
        id: technicians.id,
        name: technicians.name,
        phone: technicians.phone,
        specialization: technicians.specialization,
        location: technicians.location,
        status: technicians.status,
        rating: technicians.rating,
        completedJobs: technicians.completedJobs,
      })
      .from(technicians)
      .orderBy(desc(technicians.completedJobs));

    // حساب الحجوزات المسندة لكل فني
    const techWithBookings = await Promise.all(
      techPerformance.map(async (tech) => {
        const assignedBookings = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(bookings)
          .where(eq(bookings.technicianId, tech.id));

        const completedBookings = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(bookings)
          .where(
            and(
              eq(bookings.technicianId, tech.id),
              eq(bookings.status, "completed")
            )
          );

        return {
          ...tech,
          assignedBookings: assignedBookings[0]?.count || 0,
          completedBookings: completedBookings[0]?.count || 0,
          completionRate:
            assignedBookings[0]?.count > 0
              ? Math.round(
                  ((completedBookings[0]?.count || 0) /
                    assignedBookings[0]?.count) *
                    100
                )
              : 0,
        };
      })
    );

    return techWithBookings;
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
   * الحجوزات المعلقة لفترة طويلة (تنبيهات)
   */
  getAlerts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // حجوزات معلقة لأكثر من 24 ساعة
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    const stalePendingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "pending"),
          lte(bookings.createdAt, dayAgo)
        )
      )
      .orderBy(bookings.createdAt)
      .limit(10);

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

    // فنيين غير متصلين
    const offlineTechnicians = await db
      .select()
      .from(technicians)
      .where(eq(technicians.status, "offline"));

    return {
      stalePendingBookings,
      negativeReviews,
      offlineTechnicians,
      alertsCount:
        stalePendingBookings.length +
        negativeReviews.length +
        offlineTechnicians.length,
    };
  }),

  /**
   * إحصائيات الخدمات الأكثر طلباً
   */
  getTopServices: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const topServices = await db
      .select({
        service: bookings.service,
        count: sql<number>`COUNT(*)`,
      })
      .from(bookings)
      .groupBy(bookings.service)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);

    return topServices;
  }),

  /**
   * إحصائيات المواقع الأكثر طلباً
   */
  getTopLocations: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const topLocations = await db
      .select({
        location: bookings.location,
        count: sql<number>`COUNT(*)`,
      })
      .from(bookings)
      .groupBy(bookings.location)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);

    return topLocations;
  }),
});
