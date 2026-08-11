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
import { usersModuleRouter, getUserByEmail, createLocalUser, verifyPassword } from "./modules/users";
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

import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { setUserType } from "./db";
import { toSafeUser } from "./modules/users/repository";

export const appRouter = router({
  system: systemRouter,

  // Auth
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? toSafeUser(opts.ctx.user) : null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    setUserType: protectedProcedure.input(z.object({ userType: z.enum(["customer", "technician", "service_provider"]) })).mutation(async ({ ctx, input }) => {
      await setUserType(ctx.user.id, input.userType);
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100).trim(),
        email: z.string().email().max(320).trim(),
        password: z.string().min(8).max(200),
        phone: z.string().max(20).trim().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "البريد الإلكتروني مستخدم بالفعل" });
        }

        const user = await createLocalUser(input);
        if (!user) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء الحساب" });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true } as const;
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email().max(320).trim(),
        password: z.string().min(1).max(200),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

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
