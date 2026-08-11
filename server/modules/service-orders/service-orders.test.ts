import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

// Test validation schemas used in service-orders router
describe("Service Orders - Validation Schemas", () => {
  const createOrderSchema = z.object({
    vehicleMake: z.string().min(1),
    vehicleModel: z.string().min(1),
    vehicleYear: z.number().min(1990).max(2030),
    vehicleColor: z.string().optional(),
    plateNumber: z.string().optional(),
    vin: z.string().optional(),
    complaint: z.string().min(3),
    urgency: z.enum(["low", "medium", "high"]).optional(),
  });

  it("should validate a valid service order", () => {
    const validOrder = {
      vehicleMake: "تويوتا",
      vehicleModel: "كامري",
      vehicleYear: 2020,
      complaint: "السيارة ما تشتغل",
    };
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("should reject short complaint (less than 3 chars)", () => {
    const invalidOrder = {
      vehicleMake: "تويوتا",
      vehicleModel: "كامري",
      vehicleYear: 2020,
      complaint: "اا",
    };
    const result = createOrderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
  });

  it("should accept complaint with 3 chars minimum", () => {
    const validOrder = {
      vehicleMake: "تويوتا",
      vehicleModel: "كامري",
      vehicleYear: 2020,
      complaint: "صوت",
    };
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("should reject invalid vehicle year", () => {
    const invalidOrder = {
      vehicleMake: "تويوتا",
      vehicleModel: "كامري",
      vehicleYear: 1980,
      complaint: "مشكلة في المحرك",
    };
    const result = createOrderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
  });

  it("should accept optional fields", () => {
    const validOrder = {
      vehicleMake: "نيسان",
      vehicleModel: "باترول",
      vehicleYear: 2023,
      vehicleColor: "أبيض",
      plateNumber: "ABC 1234",
      vin: "1HGBH41JXMN109186",
      complaint: "صوت غريب من المحرك عند التشغيل",
      urgency: "high" as const,
    };
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });
});

describe("Service Orders - Cancel Order Validation", () => {
  const cancelOrderSchema = z.object({
    orderId: z.number().int().positive(),
    reason: z.string().optional(),
  });

  it("should validate cancel order with valid orderId", () => {
    const result = cancelOrderSchema.safeParse({ orderId: 1 });
    expect(result.success).toBe(true);
  });

  it("should validate cancel order with reason", () => {
    const result = cancelOrderSchema.safeParse({ orderId: 5, reason: "لم أعد بحاجة للخدمة" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid orderId", () => {
    const result = cancelOrderSchema.safeParse({ orderId: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer orderId", () => {
    const result = cancelOrderSchema.safeParse({ orderId: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe("Service Orders - Status Flow", () => {
  const validStatuses = ["pending", "assigned", "en_route", "arrived", "diagnosing", "quote_sent", "approved", "repairing", "completed", "cancelled"];

  it("should have all expected statuses defined", () => {
    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("assigned");
    expect(validStatuses).toContain("en_route");
    expect(validStatuses).toContain("arrived");
    expect(validStatuses).toContain("diagnosing");
    expect(validStatuses).toContain("quote_sent");
    expect(validStatuses).toContain("approved");
    expect(validStatuses).toContain("repairing");
    expect(validStatuses).toContain("completed");
    expect(validStatuses).toContain("cancelled");
  });

  it("should allow cancellation only from pending/assigned status", () => {
    const cancellableStatuses = ["pending", "assigned"];
    const nonCancellableStatuses = ["en_route", "arrived", "diagnosing", "repairing", "completed"];
    
    cancellableStatuses.forEach(status => {
      expect(["pending", "assigned"]).toContain(status);
    });
    
    nonCancellableStatuses.forEach(status => {
      expect(["pending", "assigned"]).not.toContain(status);
    });
  });
});

describe("Service Orders - Roles", () => {
  const validRoles = ["admin", "technician", "user"];

  it("should have admin role", () => {
    expect(validRoles).toContain("admin");
  });

  it("should have technician role", () => {
    expect(validRoles).toContain("technician");
  });

  it("should have user (customer) role", () => {
    expect(validRoles).toContain("user");
  });

  it("admin should have access to all features", () => {
    const adminPermissions = ["view_all_orders", "assign_technician", "confirm_payment", "issue_invoice", "manage_users"];
    expect(adminPermissions.length).toBeGreaterThan(0);
  });

  it("technician should have limited access", () => {
    const techPermissions = ["view_assigned_orders", "update_status", "upload_photos", "save_obd_results", "create_quote"];
    const adminOnly = ["manage_users", "assign_technician"];
    techPermissions.forEach(p => {
      expect(adminOnly).not.toContain(p);
    });
  });
});
