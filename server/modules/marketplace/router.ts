import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { createLogger } from "../../_core/logger";
import { getDb } from "../../shared/database";
import { products, productOrders, productOrderPayments } from "../../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { storagePut } from "../../shared/storage";
import { TRPCError } from "@trpc/server";

const log = createLogger("marketplace");

// Generate unique order number: PO-YYYY-XXXX
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PO-${year}-${random}`;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^ء-يa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const productsRouter = router({
  // ═══ عرض المنتجات (عام) ═══
  getAll: publicProcedure
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const activeOnly = input?.activeOnly !== false;
      if (activeOnly) {
        return await db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.createdAt));
      }
      return await db.select().from(products).orderBy(desc(products.createdAt));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(products).where(eq(products.slug, input.slug));
      return rows[0] || null;
    }),

  // ═══ إدارة المنتجات (أدمن) ═══
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const rows = await db.select().from(products).where(eq(products.id, input.id));
      return rows[0] || null;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1, "اسم المنتج مطلوب"),
      description: z.string().optional(),
      category: z.string().optional(),
      price: z.string().min(1, "السعر مطلوب"),
      stockQuantity: z.number().min(0).default(0),
      images: z.array(z.string()).default([]),
      status: z.enum(["active", "inactive"]).default("active"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      let slug = slugify(input.name) || `product-${Date.now()}`;
      const existing = await db.select().from(products).where(eq(products.slug, slug));
      if (existing.length) slug = `${slug}-${Date.now().toString().slice(-5)}`;

      const [result] = await db.insert(products).values({
        name: input.name,
        slug,
        description: input.description || null,
        category: input.category || null,
        price: input.price,
        stockQuantity: input.stockQuantity,
        images: input.images,
        status: input.status,
      });

      log.info(`Product created: ${input.name} (#${result.insertId})`);
      return { success: true, id: result.insertId, slug, message: "تم إضافة المنتج بنجاح" };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      price: z.string().optional(),
      stockQuantity: z.number().min(0).optional(),
      images: z.array(z.string()).optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.description !== undefined) updateData.description = fields.description;
      if (fields.category !== undefined) updateData.category = fields.category;
      if (fields.price !== undefined) updateData.price = fields.price;
      if (fields.stockQuantity !== undefined) updateData.stockQuantity = fields.stockQuantity;
      if (fields.images !== undefined) updateData.images = fields.images;
      if (fields.status !== undefined) updateData.status = fields.status;
      if (Object.keys(updateData).length === 0) {
        return { success: false, message: "لا توجد بيانات للتحديث" };
      }

      await db.update(products).set(updateData).where(eq(products.id, id));
      return { success: true, message: "تم تحديث المنتج بنجاح" };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const existingOrders = await db.select().from(productOrders).where(eq(productOrders.productId, input.id));
      if (existingOrders.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن حذف منتج مرتبط بطلبات - عطّله بدلاً من ذلك" });
      }

      await db.delete(products).where(eq(products.id, input.id));
      return { success: true, message: "تم حذف المنتج" };
    }),

  uploadImage: adminProcedure
    .input(z.object({ imageBase64: z.string(), mimeType: z.string() }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.imageBase64, "base64");
      const ext = input.mimeType.split("/")[1] || "jpg";
      const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const result = await storagePut(key, buffer, input.mimeType);
      return { url: result.url };
    }),
});

export const productOrdersRouter = router({
  // ═══ طلب شراء (عميل) ═══
  create: protectedProcedure
    .input(z.object({
      productId: z.number(),
      quantity: z.number().min(1).default(1),
      shippingName: z.string().min(1, "الاسم مطلوب"),
      shippingPhone: z.string().min(10, "رقم الهاتف مطلوب"),
      shippingAddress: z.string().min(3, "العنوان مطلوب"),
      shippingCity: z.string().min(1, "المدينة مطلوبة"),
      customerPhone: z.string().min(10, "رقم التواصل مطلوب"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const productRows = await db.select().from(products).where(eq(products.id, input.productId));
      if (!productRows.length) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      const product = productRows[0];
      if (product.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "المنتج غير متاح حالياً" });
      }

      const unitPrice = product.price;
      const totalPrice = (parseFloat(product.price) * input.quantity).toFixed(2);
      const orderNumber = generateOrderNumber();

      const [result] = await db.insert(productOrders).values({
        orderNumber,
        customerId: ctx.user.id,
        customerName: ctx.user.name || "عميل",
        customerPhone: input.customerPhone,
        customerEmail: ctx.user.email || null,
        productId: input.productId,
        productNameSnapshot: product.name,
        quantity: input.quantity,
        unitPrice,
        totalPrice,
        shippingName: input.shippingName,
        shippingPhone: input.shippingPhone,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        status: "pending_payment",
      });

      log.info(`Product order created: ${orderNumber} by user ${ctx.user.id}`);
      return { success: true, orderId: result.insertId, orderNumber, totalPrice };
    }),

  submitPayment: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      paymentMethod: z.enum(["bank_transfer", "stc_pay", "mada", "credit_card", "cash"]),
      reference: z.string().optional(),
      receiptBase64: z.string().optional(),
      mimeType: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orders = await db.select().from(productOrders)
        .where(and(eq(productOrders.id, input.orderId), eq(productOrders.customerId, ctx.user.id)));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      const order = orders[0];

      let receiptUrl: string | null = null;
      if (input.receiptBase64) {
        const buffer = Buffer.from(input.receiptBase64, "base64");
        const ext = (input.mimeType || "image/jpeg").split("/")[1] || "jpg";
        const key = `product-orders/${input.orderId}/receipts/${Date.now()}.${ext}`;
        const result = await storagePut(key, buffer, input.mimeType || "image/jpeg");
        receiptUrl = result.url;
      }

      await db.insert(productOrderPayments).values({
        orderId: input.orderId,
        amount: order.totalPrice,
        paymentMethod: input.paymentMethod,
        reference: input.reference,
        receiptUrl,
        status: "pending",
      });

      log.info(`Payment submitted for product order ${order.orderNumber}`);
      return { success: true, message: "تم إرسال إثبات الدفع. سيتم التحقق منه قريباً." };
    }),

  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(productOrders)
      .where(eq(productOrders.customerId, ctx.user.id))
      .orderBy(desc(productOrders.createdAt));
  }),

  getOrderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orders = await db.select().from(productOrders).where(eq(productOrders.id, input.orderId));
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      const order = orders[0];

      if (order.customerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "ليس لديك صلاحية لعرض هذا الطلب" });
      }

      const payments = await db.select().from(productOrderPayments).where(eq(productOrderPayments.orderId, input.orderId));
      return { order, payments };
    }),

  // ═══ إدارة الطلبات (أدمن) ═══
  getAllOrders: adminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input?.status) {
        return await db.select().from(productOrders)
          .where(eq(productOrders.status, input.status as any))
          .orderBy(desc(productOrders.createdAt));
      }
      return await db.select().from(productOrders).orderBy(desc(productOrders.createdAt));
    }),

  confirmPayment: adminProcedure
    .input(z.object({ paymentId: z.number(), orderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(productOrderPayments)
        .set({ status: "confirmed", confirmedAt: new Date(), confirmedBy: ctx.user.name || "أدمن" })
        .where(eq(productOrderPayments.id, input.paymentId));

      const orders = await db.select().from(productOrders).where(eq(productOrders.id, input.orderId));
      if (orders.length && orders[0].status === "pending_payment") {
        await db.update(productOrders).set({ status: "paid" }).where(eq(productOrders.id, input.orderId));
      }

      return { success: true, message: "تم تأكيد الدفع" };
    }),

  updateFulfillmentStatus: adminProcedure
    .input(z.object({
      orderId: z.number(),
      status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updateData: Record<string, unknown> = { status: input.status };
      if (input.notes !== undefined) updateData.adminNotes = input.notes;
      if (input.status === "shipped") updateData.shippedAt = new Date();
      if (input.status === "delivered") updateData.deliveredAt = new Date();

      await db.update(productOrders).set(updateData).where(eq(productOrders.id, input.orderId));
      return { success: true, message: "تم تحديث حالة الطلب" };
    }),
});
