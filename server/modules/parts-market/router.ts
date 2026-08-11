import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { partsListings } from "../../../drizzle/schema";
import { eq, desc, like, and, or, sql } from "drizzle-orm";

export const partsMarketRouter = router({
  // بحث في قطع الغيار (عام)
  search: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      partNumber: z.string().optional(),
      oemNumber: z.string().optional(),
      vin: z.string().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
      category: z.string().optional(),
      condition: z.enum(["new", "used", "refurbished"]).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      // Build conditions
      const conditions: any[] = [eq(partsListings.isAvailable, true)];
      if (input?.query) {
        conditions.push(like(partsListings.partName, `%${input.query}%`));
      }
      if (input?.partNumber) {
        conditions.push(eq(partsListings.partNumber, input.partNumber));
      }
      if (input?.oemNumber) {
        conditions.push(eq(partsListings.oemNumber, input.oemNumber));
      }
      if (input?.condition) {
        conditions.push(eq(partsListings.condition, input.condition));
      }
      if (input?.category) {
        conditions.push(eq(partsListings.category, input.category));
      }

      const results = await db.select().from(partsListings)
        .where(and(...conditions))
        .orderBy(desc(partsListings.createdAt))
        .limit(limit).offset(offset);

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(partsListings).where(and(...conditions));

      return { data: results, total: countResult.count, page, limit };
    }),

  // جلب قطعة بالتفصيل
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [part] = await db.select().from(partsListings).where(eq(partsListings.id, input.id));
      return part || null;
    }),

  // إضافة قطعة (بائع)
  create: protectedProcedure
    .input(z.object({
      partName: z.string().min(2),
      partNumber: z.string().optional(),
      oemNumber: z.string().optional(),
      compatibleVins: z.array(z.string()).optional(),
      compatibleMakes: z.array(z.string()).optional(),
      compatibleModels: z.array(z.string()).optional(),
      category: z.string().optional(),
      condition: z.enum(["new", "used", "refurbished"]).default("new"),
      price: z.string(),
      quantity: z.number().default(1),
      description: z.string().optional(),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(partsListings).values({
        vendorId: ctx.user.id,
        ...input,
        compatibleVins: input.compatibleVins || [],
        compatibleMakes: input.compatibleMakes || [],
        compatibleModels: input.compatibleModels || [],
        images: input.images || [],
      });
      return { id: result.insertId };
    }),

  // تعديل قطعة (بائع)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      partName: z.string().optional(),
      price: z.string().optional(),
      quantity: z.number().optional(),
      isAvailable: z.boolean().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(partsListings).set(data).where(eq(partsListings.id, id));
      return { success: true };
    }),

  // حذف قطعة
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(partsListings).set({ isAvailable: false }).where(eq(partsListings.id, input.id));
      return { success: true };
    }),

  // قطعي (البائع)
  getMyListings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(partsListings)
      .where(eq(partsListings.vendorId, ctx.user.id))
      .orderBy(desc(partsListings.createdAt));
  }),

  // بحث بـ VIN
  searchByVin: publicProcedure
    .input(z.object({ vin: z.string().min(5) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Search in compatibleVins JSON field
      const results = await db.select().from(partsListings)
        .where(and(
          eq(partsListings.isAvailable, true),
          sql`JSON_CONTAINS(${partsListings.compatibleVins}, JSON_QUOTE(${input.vin}))`
        ));
      return results;
    }),

  // التصنيفات المتاحة
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = await db.select({
      category: partsListings.category,
      count: sql<number>`COUNT(*)`,
    }).from(partsListings)
      .where(eq(partsListings.isAvailable, true))
      .groupBy(partsListings.category);
    return results;
  }),
});
