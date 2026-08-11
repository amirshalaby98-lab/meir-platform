import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { notifications, invoices } from "../../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const notificationsRouter = router({
  // ===== Notifications Management =====
  getNotifications: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, input.userId))
        .orderBy(desc(notifications.createdAt));
    }),

  getUnreadNotifications: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, input.userId),
            eq(notifications.isRead, false)
          )
        )
        .orderBy(desc(notifications.createdAt));
    }),

  createNotification: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum(["booking", "review", "message", "system"]),
        title: z.string(),
        message: z.string(),
        relatedId: z.number().optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(notifications).values(input);
      return { success: true, message: "تم إنشاء الإشعار بنجاح" };
    }),

  markNotificationAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));
      return { success: true, message: "تم تحديث الإشعار" };
    }),

  markAllNotificationsAsRead: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, input.userId));
      return { success: true, message: "تم تحديث جميع الإشعارات" };
    }),

  deleteNotification: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(notifications).where(eq(notifications.id, input.id));
      return { success: true, message: "تم حذف الإشعار" };
    }),

  // ===== Invoices Management =====
  getInvoices: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt));
  }),

  getInvoicesByBooking: publicProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(invoices)
        .where(eq(invoices.bookingId, input.bookingId));
    }),

  createInvoice: publicProcedure
    .input(
      z.object({
        bookingId: z.number(),
        invoiceNumber: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string().optional(),
        serviceDescription: z.string(),
        amount: z.string(),
        taxAmount: z.string().optional(),
        discountAmount: z.string().optional(),
        finalAmount: z.string(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const invoiceData: any = {
        bookingId: input.bookingId,
        invoiceNumber: input.invoiceNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        serviceDescription: input.serviceDescription,
        amount: input.amount,
        taxAmount: input.taxAmount || "0",
        discountAmount: input.discountAmount || "0",
        finalAmount: input.finalAmount,
      };
      if (input.dueDate) {
        invoiceData.dueDate = new Date(input.dueDate);
      }
      await db.insert(invoices).values(invoiceData);
      return { success: true, message: "تم إنشاء الفاتورة بنجاح" };
    }),

  updateInvoiceStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "issued", "paid", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData: any = { status: input.status };
      if (input.status === "paid") {
        updateData.paymentDate = new Date();
      }
      await db
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, input.id));
      return { success: true, message: "تم تحديث حالة الفاتورة" };
    }),

  updateInvoicePdfUrl: publicProcedure
    .input(
      z.object({
        id: z.number(),
        pdfUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(invoices)
        .set({ pdfUrl: input.pdfUrl })
        .where(eq(invoices.id, input.id));
      return { success: true, message: "تم تحديث رابط PDF" };
    }),

  deleteInvoice: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(invoices).where(eq(invoices.id, input.id));
      return { success: true, message: "تم حذف الفاتورة" };
    }),
});
