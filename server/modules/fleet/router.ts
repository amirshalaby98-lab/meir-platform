import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { fleetCompanies, fleetVehicles, fleetMaintenance } from "../../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const fleetRouter = router({
  // تسجيل شركة أسطول جديدة
  registerCompany: protectedProcedure
    .input(z.object({
      companyName: z.string().min(2),
      contactPerson: z.string().optional(),
      phone: z.string().min(9),
      email: z.string().email().optional(),
      vehicleCount: z.number().optional(),
      contractType: z.enum(["monthly", "yearly", "per_service"]).default("monthly"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(fleetCompanies).values({
        userId: ctx.user.id,
        ...input,
      });
      return { id: result.insertId };
    }),

  // جلب شركاتي
  getMyCompanies: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(fleetCompanies)
      .where(eq(fleetCompanies.userId, ctx.user.id))
      .orderBy(desc(fleetCompanies.createdAt));
  }),

  // إضافة مركبة
  addVehicle: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      vin: z.string().optional(),
      plateNumber: z.string().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
      year: z.string().optional(),
      mileage: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(fleetVehicles).values(input);
      return { id: result.insertId };
    }),

  // جلب مركبات شركة
  getVehicles: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(fleetVehicles)
        .where(eq(fleetVehicles.companyId, input.companyId))
        .orderBy(desc(fleetVehicles.createdAt));
    }),

  // تحديث مركبة
  updateVehicle: protectedProcedure
    .input(z.object({
      id: z.number(),
      mileage: z.number().optional(),
      status: z.enum(["active", "in_service", "out_of_service"]).optional(),
      lastServiceDate: z.string().optional(),
      nextServiceDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, lastServiceDate, nextServiceDate, ...data } = input;
      const updateData: any = { ...data };
      if (lastServiceDate) updateData.lastServiceDate = new Date(lastServiceDate);
      if (nextServiceDate) updateData.nextServiceDate = new Date(nextServiceDate);
      await db.update(fleetVehicles).set(updateData).where(eq(fleetVehicles.id, id));
      return { success: true };
    }),

  // جدولة صيانة
  scheduleMaintenance: protectedProcedure
    .input(z.object({
      vehicleId: z.number(),
      companyId: z.number(),
      serviceType: z.string(),
      description: z.string().optional(),
      scheduledDate: z.string(),
      technicianId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(fleetMaintenance).values({
        vehicleId: input.vehicleId,
        companyId: input.companyId,
        serviceType: input.serviceType,
        description: input.description,
        scheduledDate: new Date(input.scheduledDate),
        technicianId: input.technicianId,
        status: "scheduled",
      });
      return { id: result.insertId };
    }),

  // جلب سجل الصيانة
  getMaintenanceHistory: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      vehicleId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions: any[] = [eq(fleetMaintenance.companyId, input.companyId)];
      if (input.vehicleId) conditions.push(eq(fleetMaintenance.vehicleId, input.vehicleId));
      return db.select().from(fleetMaintenance)
        .where(and(...conditions))
        .orderBy(desc(fleetMaintenance.createdAt));
    }),

  // تحديث حالة الصيانة
  updateMaintenanceStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
      cost: z.string().optional(),
      notes: z.string().optional(),
      mileageAtService: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "completed") updateData.completedDate = new Date();
      await db.update(fleetMaintenance).set(updateData).where(eq(fleetMaintenance.id, id));
      return { success: true };
    }),

  // إحصائيات الأسطول
  getStats: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [vehicleStats] = await db.select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        inService: sql<number>`SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END)`,
      }).from(fleetVehicles).where(eq(fleetVehicles.companyId, input.companyId));

      const [maintenanceStats] = await db.select({
        total: sql<number>`COUNT(*)`,
        scheduled: sql<number>`SUM(CASE WHEN maintenanceStatus = 'scheduled' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN maintenanceStatus = 'completed' THEN 1 ELSE 0 END)`,
        totalCost: sql<string>`COALESCE(SUM(maintenanceCost), 0)`,
      }).from(fleetMaintenance).where(eq(fleetMaintenance.companyId, input.companyId));

      return { vehicles: vehicleStats, maintenance: maintenanceStats };
    }),

  // Admin: جلب جميع الشركات
  getAllCompanies: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(fleetCompanies).orderBy(desc(fleetCompanies.createdAt));
  }),
});
