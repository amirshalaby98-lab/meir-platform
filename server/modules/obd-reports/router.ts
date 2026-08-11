import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { obdScanReports, userVehicles } from "../../../drizzle/schema";
import { eq, desc, and, or, like, gte, lte } from "drizzle-orm";
import { notifyOwner } from "../../_core/notification";

const dtcCodeSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  severity: z.string().optional(),
  system: z.string().optional(),
});

const saveReportInputSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
  dtcCodes: z.array(dtcCodeSchema).optional(),
  liveData: z.record(z.string(), z.unknown()).optional(),
  multiEcuData: z.record(z.string(), z.unknown()).optional(),
  protocol: z.string().max(100).optional(),
  vin: z.string().max(50).optional(),
  make: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  mileage: z.number().int().min(0).optional(),
});

export const obdReportsRouter = router({
  /** حفظ تقرير فحص جديد */
  saveReport: protectedProcedure
    .input(saveReportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // إذا تم تحديد vehicleId، تحقق من ملكيته
      if (input.vehicleId) {
        const [vehicle] = await db
          .select()
          .from(userVehicles)
          .where(and(
            eq(userVehicles.id, input.vehicleId),
            eq(userVehicles.userId, ctx.user.id)
          ));
        if (!vehicle) throw new Error("Vehicle not found or not authorized");
      }

      const [result] = await db.insert(obdScanReports).values({
        userId: ctx.user.id,
        vehicleId: input.vehicleId,
        healthScore: input.healthScore ?? 0,
        dtcCodes: input.dtcCodes ?? [],
        liveData: input.liveData ?? {},
        multiEcuData: input.multiEcuData ?? {},
        protocol: input.protocol,
        vin: input.vin,
        make: input.make,
        model: input.model,
        year: input.year,
        mileage: input.mileage,
        reviewStatus: "pending",
      });

      const reportId = result.insertId;

      // إشعار المدير بتقرير فحص جديد
      const dtcCount = input.dtcCodes?.length ?? 0;
      const vehicleInfo = [input.make, input.model, input.year].filter(Boolean).join(" ");
      notifyOwner({
        title: "🔧 تقرير فحص OBD جديد - مير",
        content: `
تقرير فحص جديد من: ${ctx.user.name || ctx.user.email || "عميل"}
السيارة: ${vehicleInfo || "غير محدد"}
رقم الهيكل: ${input.vin || "غير محدد"}
أكواد الأعطال: ${dtcCount} كود
نسبة الصحة: ${input.healthScore ?? 0}%
البروتوكول: ${input.protocol || "غير محدد"}
        `.trim(),
      }).catch(() => {/* تجاهل أخطاء الإشعار */});

      return { id: reportId, success: true };
    }),

  /** جلب تقارير المستخدم الحالي */
  getMyReports: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const reports = await db
        .select()
        .from(obdScanReports)
        .where(eq(obdScanReports.userId, ctx.user.id))
        .orderBy(desc(obdScanReports.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return reports;
    }),

  /** جلب تفاصيل تقرير محدد */
  getReportById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [report] = await db
        .select()
        .from(obdScanReports)
        .where(and(
          eq(obdScanReports.id, input.id),
          eq(obdScanReports.userId, ctx.user.id)
        ));

      if (!report) throw new Error("Report not found or not authorized");
      return report;
    }),

  /** [Admin] جلب جميع تقارير العملاء */
  adminGetAllReports: adminProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
      reviewStatus: z.enum(["pending", "reviewed", "action_required"]).optional(),
      userId: z.number().int().positive().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];
      if (input.reviewStatus) {
        conditions.push(eq(obdScanReports.reviewStatus, input.reviewStatus));
      }
      if (input.userId) {
        conditions.push(eq(obdScanReports.userId, input.userId));
      }

      const reports = await db
        .select()
        .from(obdScanReports)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(obdScanReports.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return reports;
    }),

  /** [Admin] تحديث حالة مراجعة التقرير وإضافة ملاحظات الفني */
  adminUpdateReviewStatus: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      reviewStatus: z.enum(["pending", "reviewed", "action_required"]),
      technicianNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(obdScanReports)
        .set({
          reviewStatus: input.reviewStatus,
          technicianNotes: input.technicianNotes,
        })
        .where(eq(obdScanReports.id, input.id));

      return { success: true };
    }),

  /** [Admin] إحصائيات تقارير OBD */
  adminGetStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allReports = await db.select().from(obdScanReports);
    const total = allReports.length;
    const pending = allReports.filter(r => r.reviewStatus === "pending").length;
    const reviewed = allReports.filter(r => r.reviewStatus === "reviewed").length;
    const actionRequired = allReports.filter(r => r.reviewStatus === "action_required").length;
    const avgHealthScore = total > 0
      ? Math.round(allReports.reduce((sum, r) => sum + (r.healthScore ?? 0), 0) / total)
      : 0;

    return { total, pending, reviewed, actionRequired, avgHealthScore };
  }),
});
