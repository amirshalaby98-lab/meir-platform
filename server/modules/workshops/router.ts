import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { workshops } from "../../../drizzle/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";

export const workshopsRouter = router({
  // جلب الورش المعتمدة (عام)
  getApproved: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      specialty: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const offset = (page - 1) * limit;

      let query = db.select().from(workshops).where(eq(workshops.status, "approved"));
      const results = await query.orderBy(desc(workshops.rating)).limit(limit).offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(workshops).where(eq(workshops.status, "approved"));
      return { data: results, total: countResult.count, page, limit };
    }),

  // تسجيل ورشة جديدة
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      ownerName: z.string().optional(),
      phone: z.string().min(9),
      email: z.string().email().optional(),
      city: z.string(),
      area: z.string().optional(),
      address: z.string().optional(),
      description: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      workingHours: z.string().optional(),
      commercialLicense: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(workshops).values({
        ...input,
        specialties: input.specialties || [],
        status: "pending",
      });
      return { id: result.insertId, message: "تم تسجيل الورشة بنجاح، في انتظار الموافقة" };
    }),

  // Admin: جلب جميع الورش
  getAll: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      const results = await db.select().from(workshops).orderBy(desc(workshops.createdAt)).limit(limit).offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(workshops);
      return { data: results, total: countResult.count, page, limit };
    }),

  // Admin: تحديث حالة الورشة
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected", "suspended"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData: any = { status: input.status };
      if (input.status === "approved") updateData.approvedAt = new Date();
      await db.update(workshops).set(updateData).where(eq(workshops.id, input.id));
      return { success: true };
    }),

  // Admin: تعديل ورشة
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      area: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      workingHours: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(workshops).set(data).where(eq(workshops.id, id));
      return { success: true };
    }),

  // إحصائيات
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [stats] = await db.select({
      total: sql<number>`COUNT(*)`,
      approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
    }).from(workshops);
    return stats;
  }),
});
