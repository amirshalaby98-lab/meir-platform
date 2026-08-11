import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { createLogger } from "../../_core/logger";
import { getDb } from "../../shared/database";
import {
  serviceOrders,
  orderVehicles,
  orderVideos,
  orderStatusHistory,
  obdScanResults,
  repairQuotes,
  orderPayments,
  orderPhotos,
  serviceInvoices,
} from "../../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { storagePut, storageGet } from "../../shared/storage";
import { TRPCError } from "@trpc/server";

const log = createLogger("service-orders");

// Generate unique order number: JC-YYYY-XXXX
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `JC-${year}-${random}`;
}

// Generate unique invoice number: INV-YYYY-XXXX
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${random}`;
}

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const serviceOrdersRouter = router({
  // ═══════════════════════════════════════════════════════════════
  // إنشاء طلب جديد
  // ═══════════════════════════════════════════════════════════════
  create: protectedProcedure
    .input(
      z.object({
        vehicleBrand: z.string().min(1, "ماركة السيارة مطلوبة"),
        vehicleModel: z.string().min(1, "موديل السيارة مطلوب"),
        vehicleYear: z.string().min(4).max(4),
        plateNumber: z.string().optional(),
        vin: z.string().max(17).optional(),
        color: z.string().optional(),
        mileage: z.number().optional(),
        engineType: z.string().optional(),
        complaint: z.string().min(3, "يرجى وصف المشكلة"),
        customerPhone: z.string().min(10, "رقم الهاتف مطلوب"),
        customerLocation: z.string().optional(),
        customerLat: z.number().optional(),
        customerLng: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // 1. إنشاء سجل السيارة
      const [vehicleResult] = await db.insert(orderVehicles).values({
        customerId: ctx.user.id,
        brand: input.vehicleBrand,
        model: input.vehicleModel,
        year: input.vehicleYear,
        plateNumber: input.plateNumber || null,
        vin: input.vin || null,
        color: input.color || null,
        mileage: input.mileage || null,
        engineType: input.engineType || null,
      });

      // 2. إنشاء الطلب (Job Card)
      const orderNumber = generateOrderNumber();
      const [orderResult] = await db.insert(serviceOrders).values({
        orderNumber,
        customerId: ctx.user.id,
        customerName: ctx.user.name || "عميل",
        customerPhone: input.customerPhone,
        customerEmail: ctx.user.email || null,
        customerLocation: input.customerLocation || null,
        customerLat: input.customerLat?.toString() || null,
        customerLng: input.customerLng?.toString() || null,
        vehicleId: vehicleResult.insertId,
        complaint: input.complaint,
        status: "pending_payment",
        inspectionFee: "200.00",
      });

      // 3. تسجيل الحالة الأولى
      await db.insert(orderStatusHistory).values({
        orderId: orderResult.insertId,
        fromStatus: null,
        toStatus: "pending_payment",
        changedBy: ctx.user.name || "النظام",
        changedByRole: "system",
        notes: "تم إنشاء الطلب - بانتظار دفع رسوم الكشف",
      });

      log.info(`New service order created: ${orderNumber} by user ${ctx.user.id}`);

      return {
        success: true,
        orderId: orderResult.insertId,
        orderNumber,
        message: "تم إنشاء طلب الخدمة بنجاح. يرجى دفع رسوم الكشف (200 ريال) لمتابعة الطلب.",
      };
    }),

  // ═══════════════════════════════════════════════════════════════
  // رفع فيديو حالة السيارة (آمن)
  // ═══════════════════════════════════════════════════════════════
  uploadVideo: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        videoBase64: z.string(),
        mimeType: z.string(),
        originalName: z.string(),
        fileSize: z.number(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // التحقق من ملكية الطلب
      const orders = await db.select().from(serviceOrders)
        .where(and(eq(serviceOrders.id, input.orderId), eq(serviceOrders.customerId, ctx.user.id)));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });

      // فحص نوع الملف
      if (!ALLOWED_VIDEO_TYPES.includes(input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "نوع الملف غير مسموح. يرجى رفع فيديو (MP4, MOV, WebM)" });
      }

      // فحص الحجم
      if (input.fileSize > MAX_VIDEO_SIZE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الفيديو يتجاوز الحد المسموح (50MB)" });
      }

      // تحويل Base64 إلى Buffer وفحص Magic Bytes
      const buffer = Buffer.from(input.videoBase64, "base64");
      const magicBytes = buffer.slice(0, 12).toString("hex");

      // فحص Magic Bytes للفيديو
      const validMagic = ["000000", "1a45df", "52494646"];
      const isValidMagic = validMagic.some(m => magicBytes.startsWith(m));
      if (!isValidMagic) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "محتوى الملف غير صالح. يرجى رفع فيديو حقيقي." });
      }

      // رفع إلى S3
      const ext = input.mimeType.split("/")[1] || "mp4";
      const s3Key = `service-orders/${input.orderId}/videos/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      await storagePut(s3Key, buffer, input.mimeType);

      // حفظ في قاعدة البيانات
      await db.insert(orderVideos).values({
        orderId: input.orderId,
        s3Key,
        originalName: input.originalName.replace(/[^a-zA-Z0-9._\-\u0600-\u06FF ]/g, ""),
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        duration: input.duration || null,
      });

      log.info(`Video uploaded for order ${input.orderId} by user ${ctx.user.id}`);
      return { success: true, message: "تم رفع الفيديو بنجاح" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // تسجيل دفعة (تحويل بنكي)
  // ═══════════════════════════════════════════════════════════════
  submitPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentType: z.enum(["inspection", "repair", "additional"]),
        amount: z.string(),
        paymentMethod: z.enum(["bank_transfer", "stc_pay", "mada", "credit_card", "cash"]),
        reference: z.string().min(1, "رقم المرجع مطلوب"),
        receiptBase64: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // التحقق من ملكية الطلب
      const orders = await db.select().from(serviceOrders)
        .where(and(eq(serviceOrders.id, input.orderId), eq(serviceOrders.customerId, ctx.user.id)));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });

      // رفع إيصال التحويل إن وجد
      let receiptUrl: string | null = null;
      if (input.receiptBase64) {
        const receiptBuffer = Buffer.from(input.receiptBase64, "base64");
        const receiptKey = `service-orders/${input.orderId}/receipts/${Date.now()}-receipt.jpg`;
        const result = await storagePut(receiptKey, receiptBuffer, "image/jpeg");
        receiptUrl = result.key;
      }

      // حفظ الدفعة
      await db.insert(orderPayments).values({
        orderId: input.orderId,
        paymentType: input.paymentType,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        status: "pending",
        reference: input.reference,
        receiptUrl,
      });

      log.info(`Payment submitted for order ${input.orderId}: ${input.paymentType} - ${input.amount} SAR`);
      return { success: true, message: "تم إرسال إثبات الدفع. سيتم التحقق منه قريباً." };
    }),

  // ═══════════════════════════════════════════════════════════════
  // جلب طلبات العميل
  // ═══════════════════════════════════════════════════════════════
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(serviceOrders)
      .where(eq(serviceOrders.customerId, ctx.user.id))
      .orderBy(desc(serviceOrders.createdAt));
  }),

  // ═══════════════════════════════════════════════════════════════
  // جلب تفاصيل طلب واحد (مع كل البيانات المرتبطة)
  // ═══════════════════════════════════════════════════════════════
  getOrderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orders = await db.select().from(serviceOrders).where(eq(serviceOrders.id, input.orderId));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      const order = orders[0];

      // التحقق من الصلاحية
      if (order.customerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "ليس لديك صلاحية لعرض هذا الطلب" });
      }

      // جلب البيانات المرتبطة
      const vehicle = order.vehicleId
        ? (await db.select().from(orderVehicles).where(eq(orderVehicles.id, order.vehicleId)))[0] || null
        : null;

      const videos = await db.select().from(orderVideos).where(eq(orderVideos.orderId, input.orderId));
      const statusHistory = await db.select().from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, input.orderId))
        .orderBy(desc(orderStatusHistory.createdAt));
      const scanResults = await db.select().from(obdScanResults).where(eq(obdScanResults.orderId, input.orderId));
      const quotes = await db.select().from(repairQuotes).where(eq(repairQuotes.orderId, input.orderId));
      const payments = await db.select().from(orderPayments).where(eq(orderPayments.orderId, input.orderId));
      const photos = await db.select().from(orderPhotos).where(eq(orderPhotos.orderId, input.orderId));
      const invoices = await db.select().from(serviceInvoices).where(eq(serviceInvoices.orderId, input.orderId));

      // جلب روابط الفيديو المؤقتة
      const videosWithUrls = await Promise.all(
        videos.map(async (v) => {
          try {
            const { url } = await storageGet(v.s3Key);
            return { ...v, url };
          } catch {
            return { ...v, url: null };
          }
        })
      );

      return {
        order,
        vehicle,
        videos: videosWithUrls,
        statusHistory,
        scanResults,
        quotes,
        payments,
        photos,
        invoice: invoices[0] || null,
      };
    }),

  // ═══════════════════════════════════════════════════════════════
  // تحديث حالة الطلب (الأدمن أو الفني)
  // ═══════════════════════════════════════════════════════════════
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        newStatus: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orders = await db.select().from(serviceOrders).where(eq(serviceOrders.id, input.orderId));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      const order = orders[0];
      const oldStatus = order.status;

      await db.update(serviceOrders)
        .set({ status: input.newStatus as any })
        .where(eq(serviceOrders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: oldStatus,
        toStatus: input.newStatus,
        changedBy: ctx.user.name || "مجهول",
        changedByRole: ctx.user.role === "admin" ? "admin" : "technician",
        notes: input.notes || null,
      });

      log.info(`Order ${order.orderNumber} status: ${oldStatus} → ${input.newStatus}`);
      return { success: true, message: "تم تحديث حالة الطلب" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // تأكيد الدفع (أدمن)
  // ═══════════════════════════════════════════════════════════════
  confirmPayment: adminProcedure
    .input(z.object({ paymentId: z.number(), orderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(orderPayments)
        .set({ status: "confirmed", confirmedAt: new Date(), confirmedBy: ctx.user.name || "أدمن" })
        .where(eq(orderPayments.id, input.paymentId));

      const orders = await db.select().from(serviceOrders).where(eq(serviceOrders.id, input.orderId));
      if (orders.length && orders[0].status === "pending_payment") {
        await db.update(serviceOrders)
          .set({ status: "paid" })
          .where(eq(serviceOrders.id, input.orderId));

        await db.insert(orderStatusHistory).values({
          orderId: input.orderId,
          fromStatus: "pending_payment",
          toStatus: "paid",
          changedBy: ctx.user.name || "أدمن",
          changedByRole: "admin",
          notes: "تم تأكيد دفع رسوم الكشف",
        });
      }

      return { success: true, message: "تم تأكيد الدفع" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // تعيين فني للطلب (أدمن)
  // ═══════════════════════════════════════════════════════════════
  assignTechnician: adminProcedure
    .input(z.object({ orderId: z.number(), technicianId: z.number(), technicianName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(serviceOrders)
        .set({ technicianId: input.technicianId, technicianName: input.technicianName, status: "assigned", assignedAt: new Date() })
        .where(eq(serviceOrders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: "paid",
        toStatus: "assigned",
        changedBy: ctx.user.name || "أدمن",
        changedByRole: "admin",
        notes: `تم تعيين الفني: ${input.technicianName}`,
      });

      return { success: true, message: `تم تعيين الفني ${input.technicianName}` };
    }),

  // ═══════════════════════════════════════════════════════════════
  // حفظ نتائج فحص OBD
  // ═══════════════════════════════════════════════════════════════
  saveScanResults: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        vehicleVin: z.string().optional(),
        protocol: z.string().optional(),
        storedCodes: z.array(z.object({ code: z.string(), description: z.string().optional(), severity: z.string().optional() })).optional(),
        pendingCodes: z.array(z.object({ code: z.string(), description: z.string().optional() })).optional(),
        permanentCodes: z.array(z.object({ code: z.string(), description: z.string().optional() })).optional(),
        liveData: z.record(z.string(), z.any()).optional(),
        freezeFrameData: z.record(z.string(), z.any()).optional(),
        technicianDiagnosis: z.string().optional(),
        recommendations: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.insert(obdScanResults).values({
        orderId: input.orderId,
        vehicleVin: input.vehicleVin || null,
        protocol: input.protocol || null,
        storedCodes: input.storedCodes || null,
        pendingCodes: input.pendingCodes || null,
        permanentCodes: input.permanentCodes || null,
        liveData: input.liveData || null,
        freezeFrameData: input.freezeFrameData || null,
        technicianDiagnosis: input.technicianDiagnosis || null,
        recommendations: input.recommendations || null,
      });

      await db.update(serviceOrders)
        .set({ status: "diagnosis_complete" })
        .where(eq(serviceOrders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: "diagnosing",
        toStatus: "diagnosis_complete",
        changedBy: ctx.user.name || "فني",
        changedByRole: "technician",
        notes: `تم حفظ نتائج الفحص - ${(input.storedCodes?.length || 0)} كود`,
      });

      log.info(`OBD scan results saved for order ${input.orderId}`);
      return { success: true, message: "تم حفظ نتائج الفحص" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // إنشاء عرض صيانة
  // ═══════════════════════════════════════════════════════════════
  createRepairQuote: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        items: z.array(z.object({
          description: z.string(),
          partName: z.string().optional(),
          partCost: z.number().optional(),
          laborHours: z.number().optional(),
          laborCost: z.number().optional(),
          total: z.number(),
        })),
        subtotal: z.string(),
        tax: z.string().optional(),
        discount: z.string().optional(),
        totalAmount: z.string(),
        notes: z.string().optional(),
        validDays: z.number().default(7),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + input.validDays);

      await db.insert(repairQuotes).values({
        orderId: input.orderId,
        items: input.items,
        subtotal: input.subtotal,
        tax: input.tax || "0.00",
        discount: input.discount || "0.00",
        totalAmount: input.totalAmount,
        notes: input.notes || null,
        validUntil,
      });

      await db.update(serviceOrders)
        .set({ status: "quote_sent", repairCost: input.totalAmount })
        .where(eq(serviceOrders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: "diagnosis_complete",
        toStatus: "quote_sent",
        changedBy: ctx.user.name || "فني",
        changedByRole: "technician",
        notes: `تم إرسال عرض صيانة بقيمة ${input.totalAmount} ريال`,
      });

      return { success: true, message: "تم إرسال عرض الصيانة للعميل" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // موافقة العميل على عرض الصيانة
  // ═══════════════════════════════════════════════════════════════
  approveQuote: protectedProcedure
    .input(z.object({ quoteId: z.number(), orderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(repairQuotes)
        .set({ status: "approved", approvedAt: new Date(), approvedBy: ctx.user.name || "عميل" })
        .where(eq(repairQuotes.id, input.quoteId));

      await db.update(serviceOrders)
        .set({ status: "quote_approved" })
        .where(eq(serviceOrders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: "quote_sent",
        toStatus: "quote_approved",
        changedBy: ctx.user.name || "عميل",
        changedByRole: "customer",
        notes: "وافق العميل على عرض الصيانة",
      });

      return { success: true, message: "تمت الموافقة. يرجى دفع المبلغ لبدء الصيانة." };
    }),

  // ═══════════════════════════════════════════════════════════════
  // رفع صورة تأكيد (قبل/بعد الصيانة)
  // ═══════════════════════════════════════════════════════════════
  uploadPhoto: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        photoType: z.enum(["before", "after", "during", "receipt"]),
        photoBase64: z.string(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const buffer = Buffer.from(input.photoBase64, "base64");
      const s3Key = `service-orders/${input.orderId}/photos/${input.photoType}-${Date.now()}-${crypto.randomUUID()}.jpg`;
      await storagePut(s3Key, buffer, "image/jpeg");

      await db.insert(orderPhotos).values({
        orderId: input.orderId,
        photoType: input.photoType,
        s3Key,
        caption: input.caption || null,
        uploadedBy: ctx.user.name || "مجهول",
      });

      // لو صورة "بعد" = تأكيد انتهاء الصيانة
      if (input.photoType === "after") {
        await db.update(serviceOrders)
          .set({ status: "repair_complete" })
          .where(eq(serviceOrders.id, input.orderId));

        await db.insert(orderStatusHistory).values({
          orderId: input.orderId,
          fromStatus: "repairing",
          toStatus: "repair_complete",
          changedBy: ctx.user.name || "فني",
          changedByRole: "technician",
          notes: "تم رفع صورة تأكيد انتهاء الصيانة",
        });
      }

      return { success: true, message: "تم رفع الصورة" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // إصدار الفاتورة النهائية
  // ═══════════════════════════════════════════════════════════════
  issueInvoice: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        items: z.array(z.object({
          description: z.string(),
          quantity: z.number().default(1),
          unitPrice: z.number(),
          total: z.number(),
        })),
        subtotal: z.string(),
        tax: z.string().optional(),
        discount: z.string().optional(),
        totalAmount: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orders = await db.select().from(serviceOrders).where(eq(serviceOrders.id, input.orderId));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      const order = orders[0];

      const invoiceNumber = generateInvoiceNumber();

      await db.insert(serviceInvoices).values({
        orderId: input.orderId,
        invoiceNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        vehicleInfo: null,
        items: input.items,
        subtotal: input.subtotal,
        tax: input.tax || "0.00",
        discount: input.discount || "0.00",
        totalAmount: input.totalAmount,
        status: "issued",
        issuedAt: new Date(),
        notes: input.notes || null,
      });

      await db.update(serviceOrders)
        .set({ status: "completed", totalAmount: input.totalAmount, completedAt: new Date() })
        .where(eq(serviceOrders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: "repair_complete",
        toStatus: "completed",
        changedBy: ctx.user.name || "أدمن",
        changedByRole: "admin",
        notes: `تم إصدار الفاتورة النهائية رقم ${invoiceNumber}`,
      });

      log.info(`Invoice ${invoiceNumber} issued for order ${order.orderNumber}`);
      return { success: true, invoiceNumber, message: "تم إصدار الفاتورة النهائية" };
    }),

  // ═══════════════════════════════════════════════════════════════
  // جلب كل الطلبات (أدمن)
  // ═══════════════════════════════════════════════════════════════
  getAllOrders: adminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input?.status) {
        return await db.select().from(serviceOrders)
          .where(eq(serviceOrders.status, input.status as any))
          .orderBy(desc(serviceOrders.createdAt));
      }

      return await db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
    }),

  // ═══════════════════════════════════════════════════════════════
  // جلب طلبات الفني
  // ═══════════════════════════════════════════════════════════════
  getTechnicianOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(serviceOrders)
      .where(eq(serviceOrders.technicianId, ctx.user.id))
      .orderBy(desc(serviceOrders.createdAt));
  }),

  // ═══════════════════════════════════════════════════════════════
  // إحصائيات الطلبات (أدمن)
  // ═══════════════════════════════════════════════════════════════
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, pending: 0, active: 0, completed: 0, revenue: "0" };

    const results = await db.select({
      total: sql<number>`COUNT(*)`,
      pending: sql<number>`SUM(CASE WHEN ${serviceOrders.status} IN ('pending_payment', 'paid') THEN 1 ELSE 0 END)`,
      active: sql<number>`SUM(CASE WHEN ${serviceOrders.status} IN ('assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'diagnosis_complete', 'quote_sent', 'quote_approved', 'repair_payment_pending', 'repair_paid', 'repairing', 'repair_complete') THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN ${serviceOrders.status} = 'completed' THEN 1 ELSE 0 END)`,
      revenue: sql<string>`COALESCE(SUM(CASE WHEN ${serviceOrders.status} = 'completed' THEN ${serviceOrders.totalAmount} ELSE 0 END), 0)`,
    }).from(serviceOrders);

    return results[0] || { total: 0, pending: 0, active: 0, completed: 0, revenue: "0" };
  }),

  // ═══════════════════════════════════════════════════════════════
  // إلغاء الطلب (العميل)
  // ═══════════════════════════════════════════════════════════════
  cancelOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // تحقق أن الطلب يخص العميل
      const [order] = await db.select().from(serviceOrders).where(
        and(eq(serviceOrders.id, input.orderId), eq(serviceOrders.customerId, ctx.user.id))
      );

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      }

      // لا يمكن إلغاء طلب مكتمل أو ملغي أو في مرحلة الإصلاح
      const nonCancellable = ['completed', 'cancelled', 'repairing', 'repair_complete'];
      if (nonCancellable.includes(order.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن إلغاء الطلب في هذه المرحلة" });
      }

      // تحديث الحالة إلى ملغي
      await db.update(serviceOrders).set({
        status: 'cancelled',
        updatedAt: new Date(),
      }).where(eq(serviceOrders.id, input.orderId));

      // إضافة سجل في تاريخ الحالات
      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        fromStatus: order.status,
        toStatus: 'cancelled',
        changedBy: ctx.user.id.toString(),
        changedByRole: 'customer',
        notes: 'تم الإلغاء بواسطة العميل',
      });

      log.info(`Order ${order.orderNumber} cancelled by customer ${ctx.user.id}`);
      return { success: true, message: "تم إلغاء الطلب بنجاح" };
    }),
});
