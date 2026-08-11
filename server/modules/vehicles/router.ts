import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { userVehicles } from "../../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const vehicleInputSchema = z.object({
  make: z.string().min(1).max(100).trim(),
  model: z.string().min(1).max(100).trim(),
  year: z.number().int().min(1900).max(2100).optional(),
  vin: z.string().max(50).trim().optional(),
  mileage: z.number().int().min(0).optional(),
  color: z.string().max(50).trim().optional(),
  plateNumber: z.string().max(20).trim().optional(),
  fuelType: z.enum(["gasoline", "diesel", "hybrid", "electric"]).optional(),
  notes: z.string().max(500).trim().optional(),
});

export const vehiclesRouter = router({
  /** جلب سيارات المستخدم الحالي */
  getMyVehicles: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const vehicles = await db
      .select()
      .from(userVehicles)
      .where(eq(userVehicles.userId, ctx.user.id))
      .orderBy(desc(userVehicles.isDefault), desc(userVehicles.createdAt));
    return vehicles;
  }),

  /** إضافة سيارة جديدة */
  addVehicle: protectedProcedure
    .input(vehicleInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // إذا لم يكن للمستخدم سيارات، تصبح هذه الافتراضية
      const existingVehicles = await db
        .select({ id: userVehicles.id })
        .from(userVehicles)
        .where(eq(userVehicles.userId, ctx.user.id));

      const isDefault = existingVehicles.length === 0;

      const [result] = await db.insert(userVehicles).values({
        userId: ctx.user.id,
        make: input.make,
        model: input.model,
        year: input.year,
        vin: input.vin,
        mileage: input.mileage,
        color: input.color,
        plateNumber: input.plateNumber,
        fuelType: input.fuelType ?? "gasoline",
        notes: input.notes,
        isDefault,
      });

      return { id: result.insertId, isDefault };
    }),

  /** تعديل سيارة */
  updateVehicle: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      data: vehicleInputSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من ملكية السيارة
      const [vehicle] = await db
        .select()
        .from(userVehicles)
        .where(and(eq(userVehicles.id, input.id), eq(userVehicles.userId, ctx.user.id)));

      if (!vehicle) throw new Error("Vehicle not found or not authorized");

      await db
        .update(userVehicles)
        .set(input.data)
        .where(and(eq(userVehicles.id, input.id), eq(userVehicles.userId, ctx.user.id)));

      return { success: true };
    }),

  /** حذف سيارة */
  deleteVehicle: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من ملكية السيارة
      const [vehicle] = await db
        .select()
        .from(userVehicles)
        .where(and(eq(userVehicles.id, input.id), eq(userVehicles.userId, ctx.user.id)));

      if (!vehicle) throw new Error("Vehicle not found or not authorized");

      await db
        .delete(userVehicles)
        .where(and(eq(userVehicles.id, input.id), eq(userVehicles.userId, ctx.user.id)));

      // إذا كانت السيارة المحذوفة هي الافتراضية، نعيّن أول سيارة أخرى
      if (vehicle.isDefault) {
        const remaining = await db
          .select()
          .from(userVehicles)
          .where(eq(userVehicles.userId, ctx.user.id))
          .orderBy(desc(userVehicles.createdAt))
          .limit(1);

        if (remaining.length > 0) {
          await db
            .update(userVehicles)
            .set({ isDefault: true })
            .where(eq(userVehicles.id, remaining[0].id));
        }
      }

      return { success: true };
    }),

  /** تعيين سيارة افتراضية */
  setDefaultVehicle: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من ملكية السيارة
      const [vehicle] = await db
        .select()
        .from(userVehicles)
        .where(and(eq(userVehicles.id, input.id), eq(userVehicles.userId, ctx.user.id)));

      if (!vehicle) throw new Error("Vehicle not found or not authorized");

      // إلغاء الافتراضي من جميع سيارات المستخدم
      await db
        .update(userVehicles)
        .set({ isDefault: false })
        .where(eq(userVehicles.userId, ctx.user.id));

      // تعيين الافتراضي للسيارة المختارة
      await db
        .update(userVehicles)
        .set({ isDefault: true })
        .where(eq(userVehicles.id, input.id));

      return { success: true };
    }),
});
