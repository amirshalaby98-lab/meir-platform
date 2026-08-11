import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { carBrands, carModels, serviceParts, laborTimes, pricingSettings, priceCalculations, partsPrices, towTrucks, partsShops, junkyards, notifications, invoices, workshops } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const pricingRouter = router({
  // Get all car brands
  getBrands: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(carBrands);
  }),

  // Get models by brand
  getModelsByBrand: publicProcedure
    .input(z.object({ brandId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(carModels)
        .where(eq(carModels.brandId, input.brandId));
    }),

  // Get all service parts
  getParts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(serviceParts);
  }),

  // Get part price for specific model and part
  getPartPrice: publicProcedure
    .input(
      z.object({
        modelId: z.number(),
        partId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .select()
        .from(partsPrices)
        .where(
          and(
            eq(partsPrices.modelId, input.modelId),
            eq(partsPrices.partId, input.partId)
          )
        )
        .limit(1);
      return result[0] || null;
    }),

  // Get labor time for specific model and part
  getLaborTime: publicProcedure
    .input(
      z.object({
        modelId: z.number(),
        partId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .select()
        .from(laborTimes)
        .where(
          and(
            eq(laborTimes.modelId, input.modelId),
            eq(laborTimes.partId, input.partId)
          )
        )
        .limit(1);
      return result[0] || null;
    }),

  // Get pricing settings
  getSettings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(pricingSettings).limit(1);
    return result[0] || { hourlyRate: 100, pricePerKm: 2 };
  }),

  // Calculate price
  calculatePrice: publicProcedure
    .input(
      z.object({
        modelId: z.number(),
        partId: z.number(),
        distance: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get labor time
      const laborTimeResult = await db
        .select()
        .from(laborTimes)
        .where(
          and(
            eq(laborTimes.modelId, input.modelId),
            eq(laborTimes.partId, input.partId)
          )
        )
        .limit(1);

      if (!laborTimeResult[0]) {
        return { error: "Labor time not found for this combination" };
      }

      // Get part price
      const partPriceResult = await db
        .select()
        .from(partsPrices)
        .where(
          and(
            eq(partsPrices.modelId, input.modelId),
            eq(partsPrices.partId, input.partId)
          )
        )
        .limit(1);

      // Get pricing settings
      const settingsResult = await db.select().from(pricingSettings).limit(1);
      const settings = settingsResult[0] || { hourlyRate: 100, pricePerKm: 2 };

      const hours = parseFloat(laborTimeResult[0].hours);
      const laborCost = hours * settings.hourlyRate;
      const distanceCost = input.distance ? input.distance * settings.pricePerKm : 0;
      
      // Add part price if available
      const partPrice = partPriceResult[0]?.priceAverage || 0;
      const totalCost = laborCost + distanceCost + partPrice;

      return {
        hours,
        laborCost,
        distanceCost,
        partPrice,
        partPriceMin: partPriceResult[0]?.priceMin || 0,
        partPriceMax: partPriceResult[0]?.priceMax || 0,
        totalCost,
        hourlyRate: settings.hourlyRate,
        pricePerKm: settings.pricePerKm,
      };
    }),

  // Save price calculation
  savePriceCalculation: publicProcedure
    .input(
      z.object({
        brandId: z.number(),
        brandName: z.string(),
        modelId: z.number(),
        modelName: z.string(),
        partId: z.number(),
        partName: z.string(),
        distance: z.number(),
        laborHours: z.string(),
        hourlyRate: z.number(),
        pricePerKm: z.number(),
        laborCost: z.number(),
        distanceCost: z.number(),
        totalCost: z.number(),
        customerIp: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(priceCalculations).values(input);
      return { success: true, id: result[0].insertId };
    }),

  // Get all price calculations (with pagination)
  getPriceCalculations: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const results = await db
        .select()
        .from(priceCalculations)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(priceCalculations.createdAt);
      
      return results;
    }),

  // Get price calculation statistics
  getPriceStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const results = await db.select().from(priceCalculations);
    
    if (results.length === 0) {
      return {
        totalCalculations: 0,
        averageTotal: 0,
        averageLaborCost: 0,
        averageDistanceCost: 0,
      };
    }
    
    const totalCalculations = results.length;
    const totalSum = results.reduce((sum, calc) => sum + calc.totalCost, 0);
    const laborSum = results.reduce((sum, calc) => sum + calc.laborCost, 0);
    const distanceSum = results.reduce((sum, calc) => sum + calc.distanceCost, 0);
    
    return {
      totalCalculations,
      averageTotal: Math.round(totalSum / totalCalculations),
      averageLaborCost: Math.round(laborSum / totalCalculations),
      averageDistanceCost: Math.round(distanceSum / totalCalculations),
    };
  }),

  // Get all labor times with brand and model names
  getAllLaborTimes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const results = await db
      .select({
        id: laborTimes.id,
        brandId: carModels.brandId,
        brandName: carBrands.nameAr,
        modelId: laborTimes.modelId,
        modelName: carModels.nameAr,
        partId: laborTimes.partId,
        partName: serviceParts.nameAr,
        hours: laborTimes.hours,
      })
      .from(laborTimes)
      .leftJoin(carModels, eq(laborTimes.modelId, carModels.id))
      .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
      .leftJoin(serviceParts, eq(laborTimes.partId, serviceParts.id))
      .orderBy(carBrands.nameAr, carModels.nameAr, serviceParts.nameAr);
    
    return results;
  }),

  // Update labor time
  updateLaborTime: publicProcedure
    .input(
      z.object({
        id: z.number(),
        hours: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(laborTimes)
        .set({ hours: input.hours })
        .where(eq(laborTimes.id, input.id));
      
      return { success: true, message: "تم تحديث وقت العمل بنجاح" };
    }),

  // Update pricing settings
  updateSettings: publicProcedure
    .input(
      z.object({
        hourlyRate: z.number().min(1).max(1000),
        pricePerKm: z.number().min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Update the first (and only) settings record
      await db
        .update(pricingSettings)
        .set({
          hourlyRate: input.hourlyRate,
          pricePerKm: input.pricePerKm,
        })
        .where(eq(pricingSettings.id, 1));
      
      return { success: true, message: "تم تحديث الأسعار بنجاح" };
    }),

  // Get all part prices with details
  getAllPartPrices: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const results = await db
      .select({
        id: partsPrices.id,
        brandName: carBrands.nameAr,
        modelName: carModels.nameAr,
        partName: serviceParts.nameAr,
        partType: partsPrices.quality,
        priceMin: partsPrices.priceMin,
        priceMax: partsPrices.priceMax,
        priceAverage: partsPrices.priceAverage,
      })
      .from(partsPrices)
      .leftJoin(carModels, eq(partsPrices.modelId, carModels.id))
      .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
      .leftJoin(serviceParts, eq(partsPrices.partId, serviceParts.id))
      .orderBy(carBrands.nameAr, carModels.nameAr, serviceParts.nameAr);
    
    return results;
  }),

  // Add new part price
  addPartPrice: publicProcedure
    .input(
      z.object({
        brandId: z.number(),
        modelId: z.number(),
        partId: z.number(),
        partType: z.enum(["original", "aftermarket"]),
        priceMin: z.number().min(0),
        priceMax: z.number().min(0),
        priceAverage: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(partsPrices).values({
        modelId: input.modelId,
        partId: input.partId,
        quality: input.partType,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        priceAverage: input.priceAverage,
      });
      
      return { success: true, message: "تم إضافة السعر بنجاح" };
    }),

  // Update part price
  updatePartPrice: publicProcedure
    .input(
      z.object({
        id: z.number(),
        priceMin: z.number().min(0).optional(),
        priceMax: z.number().min(0).optional(),
        priceAverage: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const updateData: any = {};
      if (input.priceMin !== undefined) updateData.priceMin = input.priceMin;
      if (input.priceMax !== undefined) updateData.priceMax = input.priceMax;
      if (input.priceAverage !== undefined) updateData.priceAverage = input.priceAverage;
      
      await db
        .update(partsPrices)
        .set(updateData)
        .where(eq(partsPrices.id, input.id));
      
      return { success: true, message: "تم تحديث السعر بنجاح" };
    }),

  // Delete part price
  deletePartPrice: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(partsPrices)
        .where(eq(partsPrices.id, input.id));
      
      return { success: true, message: "تم حذف السعر بنجاح" };
    }),

  // ===== Tow Trucks Management =====
  getTowTrucks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(towTrucks).orderBy(towTrucks.area);
  }),

  getApprovedTowTrucks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(towTrucks).where(eq(towTrucks.status, "approved"));
  }),

  addTowTruck: adminProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(towTrucks).values(input);
      return { success: true, message: "تم إضافة السطحة بنجاح" };
    }),

  updateTowTruck: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      rating: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.area !== undefined) updateData.area = fields.area;
      if (fields.city !== undefined) updateData.city = fields.city;
      if (fields.status !== undefined) updateData.status = fields.status;
      if (fields.rating !== undefined) updateData.rating = fields.rating;
      if (Object.keys(updateData).length === 0) {
        return { success: false, message: "لا توجد بيانات للتحديث" };
      }
      await db.update(towTrucks).set(updateData).where(eq(towTrucks.id, id));
      return { success: true, message: "تم تحديث السطحة بنجاح" };
    }),

  deleteTowTruck: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(towTrucks).where(eq(towTrucks.id, input.id));
      return { success: true, message: "تم حذف السطحة بنجاح" };
    }),

  // ===== Parts Shops Management =====
  getPartsShops: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(partsShops).orderBy(partsShops.area);
  }),

  getApprovedPartsShops: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(partsShops).where(eq(partsShops.status, "approved"));
  }),

  addPartsShop: adminProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string(), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { specialty, ...rest } = input;
      await db.insert(partsShops).values({ ...rest, specialties: specialty || null });
      return { success: true, message: "تم إضافة المحل بنجاح" };
    }),

  updatePartsShop: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      specialty: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      rating: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.area !== undefined) updateData.area = fields.area;
      if (fields.city !== undefined) updateData.city = fields.city;
      if (fields.specialty !== undefined) updateData.specialties = fields.specialty;
      if (fields.status !== undefined) updateData.status = fields.status;
      if (fields.rating !== undefined) updateData.rating = fields.rating;
      if (Object.keys(updateData).length === 0) {
        return { success: false, message: "لا توجد بيانات للتحديث" };
      }
      await db.update(partsShops).set(updateData).where(eq(partsShops.id, id));
      return { success: true, message: "تم تحديث المحل بنجاح" };
    }),

  deletePartsShop: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(partsShops).where(eq(partsShops.id, input.id));
      return { success: true, message: "تم حذف المحل بنجاح" };
    }),

  // ===== Junkyards Management =====
  getJunkyards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(junkyards).orderBy(junkyards.area);
  }),

  getApprovedJunkyards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(junkyards).where(eq(junkyards.status, "approved"));
  }),

  addJunkyard: adminProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string(), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { specialty, ...rest } = input;
      await db.insert(junkyards).values({ ...rest, specialties: specialty || null });
      return { success: true, message: "تم إضافة التشليح بنجاح" };
    }),

  updateJunkyard: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      specialty: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      rating: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.area !== undefined) updateData.area = fields.area;
      if (fields.city !== undefined) updateData.city = fields.city;
      if (fields.specialty !== undefined) updateData.specialties = fields.specialty;
      if (fields.status !== undefined) updateData.status = fields.status;
      if (fields.rating !== undefined) updateData.rating = fields.rating;
      if (Object.keys(updateData).length === 0) {
        return { success: false, message: "لا توجد بيانات للتحديث" };
      }
      await db.update(junkyards).set(updateData).where(eq(junkyards.id, id));
      return { success: true, message: "تم تحديث التشليح بنجاح" };
    }),

  deleteJunkyard: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(junkyards).where(eq(junkyards.id, input.id));
      return { success: true, message: "تم حذف التشليح بنجاح" };
    }),

  // Public APIs for public submissions
  publicAddTowTruck: publicProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(towTrucks).values({ ...input, status: "pending" });
      return { success: true, message: "تم إرسال طلبك بنجاح" };
    }),
  publicAddPartsShop: publicProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string(), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { specialty, ...rest } = input;
      await db.insert(partsShops).values({ ...rest, specialties: specialty || null, status: "pending" });
      return { success: true, message: "تم إرسال طلبك بنجاح" };
    }),
  publicAddJunkyard: publicProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string(), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { specialty, ...rest } = input;
      await db.insert(junkyards).values({ ...rest, specialties: specialty || null, status: "pending" });
      return { success: true, message: "تم إرسال طلبك بنجاح" };
    }),
  publicAddWorkshop: publicProcedure
    .input(z.object({ name: z.string(), phone: z.string(), area: z.string(), city: z.string(), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { specialty, ...rest } = input;
      await db.insert(workshops).values({ ...rest, specialties: specialty ? [specialty] : null, status: "pending" });
      return { success: true, message: "تم إرسال طلبك بنجاح" };
    }),

  // Create labor time
  createLaborTime: adminProcedure
    .input(z.object({
      modelId: z.number(),
      partId: z.number(),
      hours: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(laborTimes).values(input);
      return { success: true, message: "تم إضافة وقت العمل بنجاح" };
    }),

  // Delete labor time
  deleteLaborTime: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(laborTimes).where(eq(laborTimes.id, input.id));
      return { success: true, message: "تم حذف وقت العمل بنجاح" };
    }),

  // Copy labor times from one model to another
  copyLaborTimes: adminProcedure
    .input(z.object({
      fromModelId: z.number(),
      toModelId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const sourceTimes = await db.select().from(laborTimes).where(eq(laborTimes.modelId, input.fromModelId));
      if (sourceTimes.length === 0) {
        return { success: false, message: "لا توجد أوقات عمل للموديل المصدر" };
      }
      const newTimes = sourceTimes.map(t => ({
        modelId: input.toModelId,
        partId: t.partId,
        hours: t.hours,
        notes: t.notes,
      }));
      await db.insert(laborTimes).values(newTimes);
      return { success: true, message: `تم نسخ ${sourceTimes.length} وقت عمل بنجاح` };
    }),

  // Bulk create labor times (for import)
  bulkCreateLaborTimes: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        modelId: z.number(),
        partId: z.number(),
        hours: z.string(),
        notes: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input.items.length === 0) return { success: false, message: "لا توجد بيانات للاستيراد" };
      await db.insert(laborTimes).values(input.items);
      return { success: true, message: `تم استيراد ${input.items.length} وقت عمل بنجاح` };
    }),

  // Get labor times by model
  getLaborTimesByModel: publicProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const results = await db
        .select({
          id: laborTimes.id,
          partId: laborTimes.partId,
          partName: serviceParts.nameAr,
          hours: laborTimes.hours,
          notes: laborTimes.notes,
        })
        .from(laborTimes)
        .leftJoin(serviceParts, eq(laborTimes.partId, serviceParts.id))
        .where(eq(laborTimes.modelId, input.modelId))
        .orderBy(serviceParts.nameAr);
      return results;
    }),
});
