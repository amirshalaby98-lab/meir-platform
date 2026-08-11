import { createLogger } from "../../_core/logger";
const log = createLogger("vendors");
import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { vendors, vendorVerificationCodes, vendorDocuments, vendorServices } from "../../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Helper function to generate verification code
function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8).padStart(6, "0");
}

// Helper function to send SMS (mock for now)
async function sendVerificationSMS(phone: string, code: string): Promise<void> {
  log.info(`[SMS] Sending verification code ${code} to ${phone}`);
  // TODO: Integrate with actual SMS service
}

// Helper function to send email (mock for now)
async function sendVerificationEmail(email: string, code: string): Promise<void> {
  log.info(`[Email] Sending verification code ${code} to ${email}`);
  // TODO: Integrate with actual email service
}

export const vendorsRouter = router({
  // ===== Vendor Registration =====
  register: publicProcedure
    .input(
      z.object({
        vendorType: z.enum(["parts_shop", "technician", "junkyard", "tow_truck", "trainer"]),
        businessName: z.string().min(3),
        ownerName: z.string().min(3),
        phone: z.string().min(10),
        email: z.string().email(),
        city: z.string().min(2),
        area: z.string().min(2),
        address: z.string().optional(),
        description: z.string().optional(),
        commercialLicense: z.string().optional(),
        taxId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if email already exists
      const existing = await db
        .select()
        .from(vendors)
        .where(eq(vendors.email, input.email));

      if (existing.length > 0) {
        throw new Error("البريد الإلكتروني مسجل بالفعل");
      }

      // Create vendor with pending status
      const result = await db.insert(vendors).values({
        ...input,
        status: "pending",
      });

      // Get the inserted vendor ID
      const insertedVendors = await db
        .select()
        .from(vendors)
        .where(eq(vendors.email, input.email))
        .limit(1);

      if (insertedVendors.length === 0) {
        throw new Error("فشل في إنشاء البائع");
      }

      const finalVendorId = insertedVendors[0].id;

      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save verification code
      await db.insert(vendorVerificationCodes).values({
        vendorId: finalVendorId,
        code,
        type: "sms",
        expiresAt,
      });

      // Send verification code via SMS
      await sendVerificationSMS(input.phone, code);

      return {
        success: true,
        vendorId: finalVendorId,
        message: "تم التسجيل بنجاح، يرجى التحقق من رمز التحقق المرسل إلى هاتفك",
      };
    }),

  // ===== Verify Code =====
  verifyCode: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        code: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get verification code
      const verificationCodes = await db
        .select()
        .from(vendorVerificationCodes)
        .where(
          and(
            eq(vendorVerificationCodes.vendorId, input.vendorId),
            eq(vendorVerificationCodes.code, input.code)
          )
        );

      if (verificationCodes.length === 0) {
        throw new Error("رمز التحقق غير صحيح");
      }

      const verCode = verificationCodes[0];

      // Check if code is expired
      if (verCode.expiresAt < new Date()) {
        throw new Error("انتهت صلاحية الرمز");
      }

      // Check if code already used
      if (verCode.usedAt) {
        throw new Error("تم استخدام هذا الرمز بالفعل");
      }

      // Mark code as used
      await db
        .update(vendorVerificationCodes)
        .set({ usedAt: new Date() })
        .where(eq(vendorVerificationCodes.id, verCode.id));

      // Update vendor status to verified
      await db
        .update(vendors)
        .set({ status: "verified", verifiedAt: new Date() })
        .where(eq(vendors.id, input.vendorId));

      return {
        success: true,
        message: "تم التحقق بنجاح، جاري انتظار موافقة الإدارة",
      };
    }),

  // ===== Resend Verification Code =====
  resendCode: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get vendor
      const vendorList = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, input.vendorId));

      if (vendorList.length === 0) {
        throw new Error("البائع غير موجود");
      }

      const vendor = vendorList[0];

      // Generate new code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Save new code
      await db.insert(vendorVerificationCodes).values({
        vendorId: input.vendorId,
        code,
        type: "sms",
        expiresAt,
      });

      // Send SMS
      await sendVerificationSMS(vendor.phone, code);

      return {
        success: true,
        message: "تم إرسال رمز التحقق الجديد",
      };
    }),

  // ===== Get Vendor Profile =====
  getProfile: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const vendorList = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, input.vendorId));

      if (vendorList.length === 0) {
        throw new Error("البائع غير موجود");
      }

      return vendorList[0];
    }),

  // ===== Update Vendor Profile =====
  updateProfile: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        businessName: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        bankAccount: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { vendorId, ...updateData } = input;

      await db
        .update(vendors)
        .set(updateData)
        .where(eq(vendors.id, vendorId));

      return { success: true, message: "تم تحديث الملف الشخصي" };
    }),

  // ===== Upload Document =====
  uploadDocument: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        documentType: z.enum(["commercial_license", "tax_certificate", "bank_details", "id_card"]),
        documentUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(vendorDocuments).values(input);

      return { success: true, message: "تم رفع المستند بنجاح" };
    }),

  // ===== Get Vendor Documents =====
  getDocuments: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(vendorDocuments)
        .where(eq(vendorDocuments.vendorId, input.vendorId));
    }),

  // ===== Add Service =====
  addService: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        serviceName: z.string(),
        description: z.string().optional(),
        price: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(vendorServices).values({
        ...input,
        price: input.price ? input.price.toString() : undefined,
      });

      return { success: true, message: "تم إضافة الخدمة بنجاح" };
    }),

  // ===== Get Vendor Services =====
  getServices: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(vendorServices)
        .where(eq(vendorServices.vendorId, input.vendorId));
    }),

  // ===== Admin: Get All Pending Vendors =====
  getPendingVendors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(vendors)
      .where(eq(vendors.status, "pending"))
      .orderBy(desc(vendors.createdAt));
  }),

  // ===== Admin: Get All Verified Vendors =====
  getVerifiedVendors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(vendors)
      .where(eq(vendors.status, "verified"))
      .orderBy(desc(vendors.createdAt));
  }),

  // ===== Admin: Approve Vendor =====
  approveVendor: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(vendors)
        .set({ status: "approved", approvedAt: new Date() })
        .where(eq(vendors.id, input.vendorId));

      return { success: true, message: "تم الموافقة على البائع" };
    }),

  // ===== Admin: Reject Vendor =====
  rejectVendor: publicProcedure
    .input(
      z.object({
        vendorId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(vendors)
        .set({ status: "rejected", rejectionReason: input.reason })
        .where(eq(vendors.id, input.vendorId));

      return { success: true, message: "تم رفض البائع" };
    }),

  // ===== Admin: Get All Vendors =====
  getAllVendors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(vendors)
      .orderBy(desc(vendors.createdAt));
  }),

  // ===== Admin: Get Vendor Details =====
  getVendorDetails: publicProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const vendorList = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, input.vendorId));

      if (vendorList.length === 0) {
        throw new Error("البائع غير موجود");
      }

      const vendor = vendorList[0];
      const documents = await db
        .select()
        .from(vendorDocuments)
        .where(eq(vendorDocuments.vendorId, input.vendorId));

      const services = await db
        .select()
        .from(vendorServices)
        .where(eq(vendorServices.vendorId, input.vendorId));

      return {
        vendor,
        documents,
        services,
      };
    }),

  // ===== Get Approved Vendors by Type =====
  getApprovedByType: publicProcedure
    .input(z.object({ vendorType: z.enum(["parts_shop", "technician", "junkyard", "tow_truck", "trainer"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.vendorType, input.vendorType),
            eq(vendors.status, "approved")
          )
        )
        .orderBy(desc(vendors.rating));
    }),
});
