import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import {
  vendorStats,
  serviceAnalytics,
  revenueTracking,
  monthlyRevenue,
  customerMetrics,
  bookings,
  reviews,
  vendors,
} from "../../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const analyticsRouter = router({
  // الحصول على إحصائيات البائع
  getVendorStats: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const stats = await db
        .select()
        .from(vendorStats)
        .where(eq(vendorStats.vendorId, input.vendorId))
        .limit(1);

      if (!stats.length) {
        // إنشاء إحصائيات جديدة إذا لم تكن موجودة
        await db.insert(vendorStats).values({
          vendorId: input.vendorId,
          totalRevenue: "0",
          monthlyRevenue: "0",
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          averageRating: "0",
          totalReviews: 0,
          totalCustomers: 0,
          repeatCustomers: 0,
          responseTime: 0,
        });
        return {
          vendorId: input.vendorId,
          totalRevenue: "0",
          monthlyRevenue: "0",
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          averageRating: "0",
          totalReviews: 0,
          totalCustomers: 0,
          repeatCustomers: 0,
          responseTime: 0,
        };
      }

      return stats[0];
    }),

  // الحصول على الأرباح الشهرية
  getMonthlyRevenue: publicProcedure
    .input(z.object({ vendorId: z.number(), year: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const year = input.year || new Date().getFullYear();
      const revenue = await db
        .select()
        .from(monthlyRevenue)
        .where(
          and(
            eq(monthlyRevenue.vendorId, input.vendorId),
            gte(monthlyRevenue.month, `${year}-01`),
            lte(monthlyRevenue.month, `${year}-12`)
          )
        )
        .orderBy(monthlyRevenue.month);

      return revenue;
    }),

  // الحصول على الخدمات الأكثر طلباً
  getTopServices: publicProcedure
    .input(z.object({ vendorId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const services = await db
        .select()
        .from(serviceAnalytics)
        .where(eq(serviceAnalytics.vendorId, input.vendorId))
        .orderBy(desc(serviceAnalytics.totalRequests))
        .limit(input.limit);

      return services;
    }),

  // الحصول على مقاييس العملاء
  getCustomerMetrics: publicProcedure
    .input(z.object({ vendorId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const metrics = await db
        .select()
        .from(customerMetrics)
        .where(eq(customerMetrics.vendorId, input.vendorId))
        .orderBy(desc(customerMetrics.totalSpent))
        .limit(input.limit);

      return metrics;
    }),

  // الحصول على تتبع الإيرادات
  getRevenueTracking: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Build conditions array
      const conditions = [eq(revenueTracking.vendorId, input.vendorId)];

      if (input.startDate) {
        conditions.push(
          gte(revenueTracking.transactionDate, new Date(input.startDate))
        );
      }

      if (input.endDate) {
        conditions.push(
          lte(revenueTracking.transactionDate, new Date(input.endDate))
        );
      }

      const tracking = await db
        .select()
        .from(revenueTracking)
        .where(and(...conditions))
        .orderBy(desc(revenueTracking.transactionDate))
        .limit(input.limit);

      return tracking;
    }),

  // حساب الإحصائيات المتقدمة
  getAdvancedStats: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // إجمالي الطلبات
      const totalOrders = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(eq(bookings.technicianId, input.vendorId));

      // متوسط التقييم - reviews table doesn't have vendorId, get overall average
      const avgRating = await db
        .select({ avg: sql<string>`AVG(rating)` })
        .from(reviews)
        .where(eq(reviews.approved, 1));

      // إجمالي الإيرادات
      const totalRevenue = await db
        .select({ sum: sql<string>`SUM(amount)` })
        .from(revenueTracking)
        .where(eq(revenueTracking.vendorId, input.vendorId));

      // عدد العملاء الفريدين
      const uniqueCustomers = await db
        .select({ count: sql`COUNT(DISTINCT customerId)` })
        .from(customerMetrics)
        .where(eq(customerMetrics.vendorId, input.vendorId));

      return {
        totalOrders: totalOrders[0]?.count || 0,
        averageRating: parseFloat(String(avgRating[0]?.avg || "0")),
        totalRevenue: parseFloat(String(totalRevenue[0]?.sum || "0")),
        uniqueCustomers: uniqueCustomers[0]?.count || 0,
      };
    }),

  // تحديث إحصائيات البائع
  updateVendorStats: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        totalRevenue: z.string().optional(),
        monthlyRevenue: z.string().optional(),
        totalOrders: z.number().optional(),
        completedOrders: z.number().optional(),
        pendingOrders: z.number().optional(),
        cancelledOrders: z.number().optional(),
        averageRating: z.string().optional(),
        totalReviews: z.number().optional(),
        totalCustomers: z.number().optional(),
        repeatCustomers: z.number().optional(),
        responseTime: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { vendorId, ...updates } = input;

      const existing = await db
        .select()
        .from(vendorStats)
        .where(eq(vendorStats.vendorId, vendorId))
        .limit(1);

      if (!existing.length) {
        await db.insert(vendorStats).values({
          vendorId,
          ...updates,
        });
      } else {
        await db
          .update(vendorStats)
          .set(updates)
          .where(eq(vendorStats.vendorId, vendorId));
      }

      return { success: true };
    }),

  // إضافة تتبع إيرادات جديد
  addRevenueTracking: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        orderId: z.number(),
        amount: z.string(),
        commission: z.string().optional(),
        netAmount: z.string(),
        paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(revenueTracking).values({
        vendorId: input.vendorId,
        orderId: input.orderId,
        amount: input.amount,
        commission: input.commission || "0",
        netAmount: input.netAmount,
        paymentStatus: input.paymentStatus,
      });

      return { success: true };
    }),

  // الحصول على ملخص الإحصائيات
  getSummary: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const stats = await db
        .select()
        .from(vendorStats)
        .where(eq(vendorStats.vendorId, input.vendorId))
        .limit(1);

      const topServices = await db
        .select()
        .from(serviceAnalytics)
        .where(eq(serviceAnalytics.vendorId, input.vendorId))
        .orderBy(desc(serviceAnalytics.totalRequests))
        .limit(5);

      const monthlyData = await db
        .select()
        .from(monthlyRevenue)
        .where(eq(monthlyRevenue.vendorId, input.vendorId))
        .orderBy(desc(monthlyRevenue.month))
        .limit(12);

      return {
        stats: stats[0] || null,
        topServices,
        monthlyData,
      };
    }),
});
