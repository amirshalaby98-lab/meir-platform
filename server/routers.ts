import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

// Module routers
import { contactModuleRouter } from "./modules/contacts";
import { reviewModuleRouter } from "./modules/reviews";
import { adminModuleRouter, adminDashboardRouter } from "./modules/admin";
import { usersModuleRouter, getUserByEmail, createLocalUser, verifyPassword, createPasswordResetCode, consumePasswordResetCode, updateUserPassword } from "./modules/users";
import { sendPasswordResetEmail } from "./modules/email";
import { carDataRouter, advancedPricingRouter, pricingRouter } from "./modules/pricing";
import { loyaltyModuleRouter } from "./modules/loyalty";
import { statsModuleRouter } from "./modules/stats";
import { coursesRouter, lessonsRouter } from "./modules/courses";
import { promotionsRouter } from "./modules/promotions";
import { reportsRouter } from "./modules/reports";
import { notificationsRouter } from "./modules/notifications";
import { vendorsRouter } from "./modules/vendors";
import { chatRouter } from "./modules/chat";
import { analyticsRouter } from "./modules/analytics";
import { diagnosticsRouter } from "./modules/diagnostics/router";
import { consultationsRouter } from "./modules/consultations/router";
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
    setUserType: protectedProcedure.input(z.object({ userType: z.enum(["customer", "service_provider"]) })).mutation(async ({ ctx, input }) => {
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
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email().max(320).trim() }))
      .mutation(async ({ input }) => {
        // Always return the same generic response whether or not the email
        // exists, so this endpoint can't be used to enumerate registered
        // accounts. Only actually send a code if there's a real local
        // account behind that email.
        const user = await getUserByEmail(input.email);
        if (user && user.passwordHash) {
          const code = await createPasswordResetCode(user.id);
          await sendPasswordResetEmail(input.email, code);
        }

        return {
          success: true,
          message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فسيتم إرسال رمز التحقق إليه",
        } as const;
      }),
    resetPassword: publicProcedure
      .input(z.object({
        email: z.string().email().max(320).trim(),
        code: z.string().min(1).max(10),
        newPassword: z.string().min(8).max(200),
      }))
      .mutation(async ({ ctx, input }) => {
        const genericError = new TRPCError({ code: "BAD_REQUEST", message: "رمز التحقق غير صحيح أو منتهي الصلاحية" });

        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw genericError;
        }

        const valid = await consumePasswordResetCode(user.id, input.code);
        if (!valid) {
          throw genericError;
        }

        await updateUserPassword(user.id, input.newPassword);

        // Log the user in immediately after a successful reset.
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
  contact: contactModuleRouter,
  review: reviewModuleRouter,
  admin: adminModuleRouter,
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
  serviceOrders: serviceOrdersRouter,
  vehicles: vehiclesRouter,
  obdReports: obdReportsRouter,
});

export type AppRouter = typeof appRouter;
