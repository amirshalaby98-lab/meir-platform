import { describe, it, expect, vi } from "vitest";
import { notificationsRouter } from "./notifications";

// Mock context for notifications router (uses publicProcedure, no auth needed)
function createMockContext() {
  return {
    req: {
      headers: {
        "x-forwarded-for": "127.0.0.1",
        "user-agent": "vitest",
      },
      socket: { remoteAddress: "127.0.0.1" },
    } as any,
    res: {} as any,
    user: null,
  };
}

describe("Notifications Router", () => {
  it("should create a notification", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());
    const result = await caller.createNotification({
      userId: 1,
      type: "booking",
      title: "حجز جديد",
      message: "تم استقبال حجز جديد",
      relatedId: 1,
      actionUrl: "/admin/bookings/1",
    });
    expect(result.success).toBe(true);
  });

  it("should get notifications for user", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());
    const result = await caller.getNotifications({ userId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should mark notification as read", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());

    // Create a notification first
    await caller.createNotification({
      userId: 1,
      type: "review",
      title: "تقييم جديد",
      message: "تم استقبال تقييم جديد",
    });

    // Get notifications
    const notifs = await caller.getNotifications({ userId: 1 });
    if (notifs.length > 0) {
      const result = await caller.markNotificationAsRead({ id: notifs[0].id });
      expect(result.success).toBe(true);
    }
  });

  it("should get unread notifications", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());
    const result = await caller.getUnreadNotifications({ userId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Invoices Router", () => {
  it("should create an invoice", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());
    const result = await caller.createInvoice({
      bookingId: 1,
      invoiceNumber: `INV-TEST-${Date.now()}-1`,
      customerName: "أحمد محمد",
      customerPhone: "0543257872",
      customerEmail: "ahmed@example.com",
      serviceDescription: "صيانة السيارة",
      amount: "500",
      taxAmount: "50",
      discountAmount: "0",
      finalAmount: "550",
    });
    expect(result.success).toBe(true);
  });

  it("should get all invoices", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());
    const result = await caller.getInvoices();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update invoice status", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());

    // Create an invoice first
    await caller.createInvoice({
      bookingId: 2,
      invoiceNumber: `INV-TEST-${Date.now()}-2`,
      customerName: "محمد علي",
      customerPhone: "0543257872",
      customerEmail: "mohammed@example.com",
      serviceDescription: "إصلاح المحرك",
      amount: "1000",
      taxAmount: "100",
      discountAmount: "0",
      finalAmount: "1100",
    });

    // Get invoices
    const invoicesList = await caller.getInvoices();
    if (invoicesList.length > 0) {
      const result = await caller.updateInvoiceStatus({
        id: invoicesList[0].id,
        status: "issued",
      });
      expect(result.success).toBe(true);
    }
  });

  it("should get invoices by booking", async () => {
    const caller = notificationsRouter.createCaller(createMockContext());
    const result = await caller.getInvoicesByBooking({ bookingId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});
