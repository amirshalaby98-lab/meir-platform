import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

// Module routers
import { bookingModuleRouter } from "./modules/booking";
import { contactModuleRouter } from "./modules/contacts";
import { reviewModuleRouter } from "./modules/reviews";
import { technicianModuleRouter } from "./modules/technicians";
import { adminModuleRouter, adminDashboardRouter } from "./modules/admin";
import { usersModuleRouter } from "./modules/users";
import { carDataRouter, advancedPricingRouter, pricingRouter } from "./modules/pricing";
import { loyaltyModuleRouter } from "./modules/loyalty";
import { statsModuleRouter } from "./modules/stats";
import { trackingModuleRouter } from "./modules/tracking";
import { coursesRouter, lessonsRouter } from "./modules/courses";
import { promotionsRouter } from "./modules/promotions";
import { reportsRouter } from "./modules/reports";
import { notificationsRouter } from "./modules/notifications";
import { vendorsRouter } from "./modules/vendors";
import { chatRouter } from "./modules/chat";
import { analyticsRouter } from "./modules/analytics";
import { diagnosticsRouter } from "./modules/diagnostics/router";
import { consultationsRouter } from "./modules/consultations/router";
import { workshopsRouter } from "./modules/workshops/router";
import { partsMarketRouter } from "./modules/parts-market/router";
import { fleetRouter } from "./modules/fleet/router";
import { serviceOrdersRouter } from "./modules/service-orders";
import { vehiclesRouter } from "./modules/vehicles/router";
import { obdReportsRouter } from "./modules/obd-reports/router";

import { setUserType } from "./db";

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
  // Module routers (server/modules/<domain>/router.ts)
  // ═══════════════════════════════════════════════════════════════
  booking: bookingModuleRouter,
  contact: contactModuleRouter,
  review: reviewModuleRouter,
  technician: technicianModuleRouter,
  admin: adminModuleRouter,
  tracking: trackingModuleRouter,
  stats: statsModuleRouter,
  loyalty: loyaltyModuleRouter,
  users: usersModuleRouter,
  carData: carDataRouter,
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
});

export type AppRouter = typeof appRouter;
