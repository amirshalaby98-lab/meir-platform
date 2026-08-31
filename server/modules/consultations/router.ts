import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { consultations, consultationReports, consultationPayments } from "../../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { invokeLLM } from "../../_core/llm";
import { storagePut } from "../../shared/storage";

export const consultationsRouter = router({
  // إنشاء استشارة جديدة
  create: protectedProcedure
    .input(z.object({
      consultationType: z.enum(["quick", "detailed", "emergency"]),
      vehicleInfo: z.object({
        make: z.string(),
        model: z.string(),
        year: z.string(),
        mileage: z.number().optional(),
        vin: z.string().optional(),
      }),
      description: z.string().min(10),
      attachments: z.array(z.object({
        type: z.enum(["image", "video", "pdf"]),
        url: z.string(),
        name: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const prices = { quick: "50.00", detailed: "150.00", emergency: "250.00" };
      const [result] = await db.insert(consultations).values({
        userId: ctx.user.id,
        consultationType: input.consultationType,
        vehicleInfo: input.vehicleInfo,
        description: input.description,
        attachments: input.attachments || [],
        price: prices[input.consultationType],
        status: "pending_payment",
      });
      return { id: result.insertId, price: prices[input.consultationType] };
    }),

  // إرسال إيصال الدفع
  submitPayment: protectedProcedure
    .input(z.object({
      consultationId: z.number(),
      paymentMethod: z.enum(["bank_transfer", "stc_pay", "mada", "credit_card", "cash"]),
      reference: z.string().optional(),
      receiptBase64: z.string().optional(),
      mimeType: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [consultation] = await db.select().from(consultations).where(eq(consultations.id, input.consultationId));
      if (!consultation) throw new Error("الاستشارة غير موجودة");
      if (consultation.userId !== ctx.user.id) throw new Error("غير مصرح لك بهذا الإجراء");

      let receiptUrl: string | null = null;
      if (input.receiptBase64) {
        const buffer = Buffer.from(input.receiptBase64, "base64");
        const ext = (input.mimeType || "image/jpeg").split("/")[1] || "jpg";
        const key = `consultations/${input.consultationId}/receipts/${Date.now()}.${ext}`;
        const result = await storagePut(key, buffer, input.mimeType || "image/jpeg");
        receiptUrl = result.url;
      }

      await db.insert(consultationPayments).values({
        consultationId: input.consultationId,
        amount: consultation.price || "0",
        paymentMethod: input.paymentMethod,
        reference: input.reference,
        receiptUrl,
        status: "pending",
      });

      return { success: true, message: "تم إرسال إثبات الدفع، سيتم مراجعته من الإدارة" };
    }),

  // Admin: تأكيد الدفع
  confirmPayment: adminProcedure
    .input(z.object({ paymentId: z.number(), consultationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(consultationPayments)
        .set({ status: "confirmed", confirmedAt: new Date(), confirmedBy: ctx.user.name || "أدمن" })
        .where(eq(consultationPayments.id, input.paymentId));

      await db.update(consultations)
        .set({ status: "pending", isPaid: true, paidAt: new Date() })
        .where(eq(consultations.id, input.consultationId));

      return { success: true, message: "تم تأكيد الدفع" };
    }),

  // جلب استشاراتي
  getMyConsultations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(consultations)
      .where(eq(consultations.userId, ctx.user.id))
      .orderBy(desc(consultations.createdAt));
  }),

  // جلب استشارة بالتفصيل
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [consultation] = await db.select().from(consultations).where(eq(consultations.id, input.id));
      if (!consultation) return null;
      if (consultation.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("غير مصرح لك بعرض هذه الاستشارة");
      }
      const reports = await db.select().from(consultationReports)
        .where(eq(consultationReports.consultationId, input.id));
      const payments = await db.select().from(consultationPayments)
        .where(eq(consultationPayments.consultationId, input.id));
      return { ...consultation, reports, payments };
    }),

  // تحليل AI سريع للاستشارة
  aiAnalysis: protectedProcedure
    .input(z.object({
      vehicleInfo: z.object({
        make: z.string(),
        model: z.string(),
        year: z.string(),
        mileage: z.number().optional(),
      }),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `أنت مهندس سيارات خبير. قم بتحليل المشكلة التالية وقدم تشخيصاً أولياً:

السيارة: ${input.vehicleInfo.make} ${input.vehicleInfo.model} ${input.vehicleInfo.year}
${input.vehicleInfo.mileage ? `الكيلومترات: ${input.vehicleInfo.mileage}` : ""}

وصف المشكلة: ${input.description}

قدم:
1. التشخيص المحتمل (3 احتمالات مرتبة بالأرجحية)
2. خطوات الفحص المقترحة
3. القطع المحتمل تلفها
4. التكلفة التقديرية
5. مستوى الخطورة (منخفض/متوسط/مرتفع/حرج)

أجب بالعربية بشكل مختصر ومفيد.`;

      const result = await invokeLLM({ messages: [{ role: "user", content: prompt }] });
      const text = result.choices?.[0]?.message?.content;
      return { analysis: typeof text === "string" ? text : "لم يتمكن النظام من التحليل" };
    }),

  // Admin: جلب جميع الاستشارات
  getAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(consultations).orderBy(desc(consultations.createdAt));
  }),

  // Admin: تعيين مهندس
  assignEngineer: adminProcedure
    .input(z.object({ consultationId: z.number(), engineerId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(consultations)
        .set({ engineerId: input.engineerId, status: "assigned" })
        .where(eq(consultations.id, input.consultationId));
      return { success: true };
    }),

  // Admin: إضافة تقرير
  addReport: adminProcedure
    .input(z.object({
      consultationId: z.number(),
      diagnosis: z.string(),
      recommendations: z.string(),
      estimatedCost: z.string().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      partsNeeded: z.array(z.object({
        name: z.string(),
        partNumber: z.string().optional(),
        estimatedPrice: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(consultationReports).values({
        consultationId: input.consultationId,
        engineerId: ctx.user.id,
        diagnosis: input.diagnosis,
        recommendations: input.recommendations,
        estimatedCost: input.estimatedCost,
        severity: input.severity,
        partsNeeded: input.partsNeeded || [],
      });
      await db.update(consultations)
        .set({ status: "completed" })
        .where(eq(consultations.id, input.consultationId));
      return { success: true };
    }),

  // إحصائيات
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [stats] = await db.select({
      total: sql<number>`COUNT(*)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    }).from(consultations);
    return stats;
  }),
});
