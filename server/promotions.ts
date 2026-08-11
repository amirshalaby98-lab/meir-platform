import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { promotions } from "../drizzle/schema";
import { eq, and, lte, gte } from "drizzle-orm";

export const promotionsRouter = router({
  // Get all promotions
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(promotions).orderBy(promotions.createdAt);
  }),

  // Get active promotions
  getActive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const now = new Date();
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          lte(promotions.startDate, now),
          gte(promotions.endDate, now)
        )
      );
  }),

  // Get promotion by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, input.id))
        .limit(1);
      
      return result[0] || null;
    }),

  // Create new promotion
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().min(1),
        targetType: z.enum(["all", "specific_parts"]),
        targetPartIds: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Validate dates
      if (input.endDate <= input.startDate) {
        throw new Error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      }
      
      // Validate discount value
      if (input.discountType === "percentage" && input.discountValue > 100) {
        throw new Error("نسبة الخصم يجب أن تكون أقل من أو تساوي 100%");
      }
      
      const result = await db.insert(promotions).values(input);
      return { success: true, id: result[0].insertId };
    }),

  // Update promotion
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().min(1).optional(),
        targetType: z.enum(["all", "specific_parts"]).optional(),
        targetPartIds: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updateData } = input;
      
      await db
        .update(promotions)
        .set(updateData)
        .where(eq(promotions.id, id));
      
      return { success: true, message: "تم تحديث العرض بنجاح" };
    }),

  // Delete promotion
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(promotions).where(eq(promotions.id, input.id));
      return { success: true, message: "تم حذف العرض بنجاح" };
    }),

  // Toggle promotion active status
  toggleActive: publicProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(promotions)
        .set({ isActive: input.isActive })
        .where(eq(promotions.id, input.id));
      
      return { success: true, message: input.isActive ? "تم تفعيل العرض" : "تم تعطيل العرض" };
    }),

  // Calculate discount for a part
  calculateDiscount: publicProcedure
    .input(
      z.object({
        partId: z.number(),
        originalPrice: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get active promotions
      const now = new Date();
      const activePromotions = await db
        .select()
        .from(promotions)
        .where(
          and(
            eq(promotions.isActive, true),
            lte(promotions.startDate, now),
            gte(promotions.endDate, now)
          )
        );
      
      // Find applicable promotion
      let bestDiscount = 0;
      let appliedPromotion = null;
      
      for (const promo of activePromotions) {
        // Check if promotion applies to this part
        if (promo.targetType === "specific_parts") {
          const targetIds = promo.targetPartIds?.split(",").map(id => parseInt(id.trim())) || [];
          if (!targetIds.includes(input.partId)) {
            continue;
          }
        }
        
        // Calculate discount
        let discount = 0;
        if (promo.discountType === "percentage") {
          discount = (input.originalPrice * promo.discountValue) / 100;
        } else {
          discount = promo.discountValue;
        }
        
        // Keep the best discount
        if (discount > bestDiscount) {
          bestDiscount = discount;
          appliedPromotion = promo;
        }
      }
      
      return {
        hasDiscount: bestDiscount > 0,
        discountAmount: bestDiscount,
        finalPrice: input.originalPrice - bestDiscount,
        promotion: appliedPromotion,
      };
    }),
});
