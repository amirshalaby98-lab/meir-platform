import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";

// Mock request/response objects with proper headers and socket
function createMockContext(user: any = null) {
  return {
    req: {
      headers: {
        "x-forwarded-for": "127.0.0.1",
        "user-agent": "vitest",
      },
      socket: { remoteAddress: "127.0.0.1" },
      requestId: "test-request-id",
    } as any,
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as any,
    user,
  };
}

// Mock admin user for admin-only routes
const mockAdminUser = {
  id: 1,
  openId: "test-admin-open-id",
  name: "Admin User",
  email: "admin@test.com",
  role: "admin" as const,
  loginMethod: "google",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("Contact Router", () => {
  it("should create a contact message successfully", async () => {
    const caller = appRouter.createCaller(createMockContext());

    const result = await caller.contact.create({
      name: "فاطمة علي",
      phone: "0501234567",
      email: "test@example.com",
      message: "هذه رسالة اختبار للتأكد من عمل النظام بشكل صحيح",
    });

    expect(result.success).toBe(true);
  });

  it("should reject contact with short message", async () => {
    const caller = appRouter.createCaller(createMockContext());

    await expect(
      caller.contact.create({
        name: "فاطمة علي",
        phone: "0501234567",
        email: "test@example.com",
        message: "قصير", // Too short
      })
    ).rejects.toThrow();
  });
});

describe("Review Router", () => {
  it("should create a review successfully", async () => {
    const caller = appRouter.createCaller(createMockContext());

    const result = await caller.review.create({
      name: "أحمد سالم",
      rating: 5,
      comment: "خدمة ممتازة جداً! الفني كان محترف وسريع في حل المشكلة",
      service: "🔋 بطارية",
      location: "مكة المكرمة",
    });

    expect(result.success).toBe(true);
  });

  it("should reject review with invalid rating", async () => {
    const caller = appRouter.createCaller(createMockContext());

    await expect(
      caller.review.create({
        name: "أحمد سالم",
        rating: 6, // Invalid rating (must be 1-5)
        comment: "خدمة ممتازة جداً! الفني كان محترف وسريع في حل المشكلة",
        service: "🔋 بطارية",
        location: "مكة المكرمة",
      })
    ).rejects.toThrow();
  });

  it("should get approved reviews only", async () => {
    const caller = appRouter.createCaller(createMockContext());

    const reviews = await caller.review.getApproved();

    // All returned reviews should be approved
    reviews.forEach((review) => {
      expect(review.approved).toBe(1);
    });
  });
});

describe("Admin Router", () => {
  it("should get all messages", async () => {
    const caller = appRouter.createCaller(createMockContext(mockAdminUser));

    const messages = await caller.admin.getMessages();
    expect(Array.isArray(messages)).toBe(true);
  });

  it("should reject non-admin users", async () => {
    const caller = appRouter.createCaller(createMockContext(null));

    await expect(caller.admin.getMessages()).rejects.toThrow();
  });
});
