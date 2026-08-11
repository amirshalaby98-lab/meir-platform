import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, adminProcedure, protectedProcedure, router } from "./_core/trpc";

// Module routers
import { bookingModuleRouter } from "./modules/booking";
import { contactModuleRouter } from "./modules/contacts";
import { reviewModuleRouter } from "./modules/reviews";
import { technicianModuleRouter } from "./modules/technicians";
import { adminModuleRouter } from "./modules/admin";
import { usersModuleRouter } from "./modules/users";
import { carDataRouter } from "./modules/pricing";
import { loyaltyModuleRouter } from "./modules/loyalty";
import { statsModuleRouter } from "./modules/stats";
import { trackingModuleRouter } from "./modules/tracking";

// Existing standalone routers
import { coursesRouter } from "./courses";
import { lessonsRouter } from "./lessons";
import { pricingRouter } from "./pricing";
import { promotionsRouter } from "./promotions";
import { reportsRouter } from "./reports";
import { notificationsRouter } from "./notifications";
import { vendorsRouter } from "./vendors";
import { advancedPricingRouter } from "./advancedPricing";
import { chatRouter } from "./chat";
import { analyticsRouter } from "./analytics";
import { adminDashboardRouter } from "./adminDashboard";
import { diagnosticsRouter } from "./modules/diagnostics/router";
import { consultationsRouter } from "./modules/consultations/router";
import { workshopsRouter } from "./modules/workshops/router";
import { partsMarketRouter } from "./modules/parts-market/router";
import { fleetRouter } from "./modules/fleet/router";
import { serviceOrdersRouter } from "./modules/service-orders";
import { vehiclesRouter } from "./modules/vehicles/router";
import { obdReportsRouter } from "./modules/obd-reports/router";

// DB functions for backward-compatible flat endpoints
import {
  getAllCarBrands, getCarBrandById, createCarBrand, updateCarBrand, deleteCarBrand,
  getAllCarModels, getCarModelsByBrand, getCarModelById, createCarModel, updateCarModel, deleteCarModel,
  getAllServiceParts, getServicePartById, createServicePart, updateServicePart, deleteServicePart,
  getAllUsers, getUserById, updateUserRole, setUserType, toggleUserActive,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  // Auth
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    setUserType: protectedProcedure.input(z.object({ userType: z.enum(["customer", "technician", "service_provider"]) })).mutation(async ({ ctx, input }) => {
      await setUserType(ctx.user.id, input.userType);
      return { success: true } as const;
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // Core module routers (new modular structure)
  // ═══════════════════════════════════════════════════════════════
  booking: bookingModuleRouter,
  contact: contactModuleRouter,
  review: reviewModuleRouter,
  technician: technicianModuleRouter,
  admin: adminModuleRouter,
  tracking: trackingModuleRouter,
  stats: statsModuleRouter,
  loyalty: loyaltyModuleRouter,

  // Users management
  users: usersModuleRouter,

  // Car data management
  carData: carDataRouter,

  // ═══════════════════════════════════════════════════════════════
  // Feature routers (existing standalone files)
  // ═══════════════════════════════════════════════════════════════
  courses: coursesRouter,
  lessons: lessonsRouter,
  pricing: pricingRouter,
  promotions: promotionsRouter,
  reports: reportsRouter,
  notifications: notificationsRouter,
  vendors: vendorsRouter,
  advancedPricing: advancedPricingRouter,
  chat: chatRouter,
  analytics: analyticsRouter,
  adminDashboard: adminDashboardRouter,
  diagnostics: diagnosticsRouter,
  consultations: consultationsRouter,
  workshops: workshopsRouter,
  partsMarket: partsMarketRouter,
  fleet: fleetRouter,
  serviceOrders: serviceOrdersRouter,
  vehicles: vehiclesRouter,
  obdReports: obdReportsRouter,

  // ═══════════════════════════════════════════════════════════════
  // Backward-compatible flat endpoints
  // These will be deprecated in favor of the modular structure above
  // ═══════════════════════════════════════════════════════════════

  // Car Brands (flat) → use carData.getCarBrands instead
  getCarBrands: publicProcedure.query(async () => await getAllCarBrands()),
  getCarBrandById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => await getCarBrandById(input.id)),
  createCarBrand: adminProcedure.input(z.object({ name: z.string().min(1).max(100).trim(), nameAr: z.string().min(1).max(100).trim(), logo: z.string().max(500).optional() })).mutation(async ({ input }) => await createCarBrand(input)),
  updateCarBrand: adminProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(1).max(100).trim().optional(), nameAr: z.string().min(1).max(100).trim().optional(), logo: z.string().max(500).optional(), isActive: z.boolean().optional() })).mutation(async ({ input }) => await updateCarBrand(input.id, { name: input.name, nameAr: input.nameAr, logo: input.logo, isActive: input.isActive })),
  deleteCarBrand: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => await deleteCarBrand(input.id)),

  // Car Models (flat) → use carData.getCarModels instead
  getCarModels: publicProcedure.query(async () => await getAllCarModels()),
  getCarModelsByBrand: publicProcedure.input(z.object({ brandId: z.number() })).query(async ({ input }) => await getCarModelsByBrand(input.brandId)),
  getCarModelById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => await getCarModelById(input.id)),
  createCarModel: adminProcedure.input(z.object({ brandId: z.number().int().positive(), name: z.string().min(1).max(100).trim(), nameAr: z.string().min(1).max(100).trim(), image: z.string().max(500).optional(), yearFrom: z.number().int().min(1900).max(2100).optional(), yearTo: z.number().int().min(1900).max(2100).optional() })).mutation(async ({ input }) => await createCarModel(input)),
  updateCarModel: adminProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(1).max(100).trim().optional(), nameAr: z.string().min(1).max(100).trim().optional(), image: z.string().max(500).optional(), yearFrom: z.number().int().min(1900).max(2100).optional(), yearTo: z.number().int().min(1900).max(2100).optional(), isActive: z.boolean().optional() })).mutation(async ({ input }) => await updateCarModel(input.id, { name: input.name, nameAr: input.nameAr, image: input.image, yearFrom: input.yearFrom, yearTo: input.yearTo, isActive: input.isActive })),
  deleteCarModel: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => await deleteCarModel(input.id)),

  // Service Parts (flat) → use carData.getServiceParts instead
  getServiceParts: publicProcedure.query(async () => await getAllServiceParts()),
  getServicePartById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => await getServicePartById(input.id)),
  createServicePart: adminProcedure.input(z.object({ name: z.string().min(1).max(200).trim(), nameAr: z.string().min(1).max(200).trim(), category: z.string().max(100).trim().optional() })).mutation(async ({ input }) => await createServicePart(input)),
  updateServicePart: adminProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(1).max(200).trim().optional(), nameAr: z.string().min(1).max(200).trim().optional(), description: z.string().max(1000).trim().optional() })).mutation(async ({ input }) => await updateServicePart(input.id, { name: input.name, nameAr: input.nameAr, description: input.description })),
  deleteServicePart: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => await deleteServicePart(input.id)),

  // Users (flat) → use users.getAll instead
  getUsers: adminProcedure.query(async () => await getAllUsers()),
  getUserById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => await getUserById(input.id)),
  updateUserRole: adminProcedure.input(z.object({ id: z.number().int().positive(), role: z.string().min(1).max(50).trim() })).mutation(async ({ input }) => await updateUserRole(input.id, input.role)),
  toggleUserActive: adminProcedure.input(z.object({ id: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ input }) => await toggleUserActive(input.id, input.isActive)),
});

export type AppRouter = typeof appRouter;
