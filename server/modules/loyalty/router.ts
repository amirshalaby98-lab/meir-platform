import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import {
  getCustomerPoints,
  redeemPoints,
  getPointsHistory,
  getAvailableRewards,
  getLoyaltyStats,
  REWARDS,
} from "../../loyalty";

export const loyaltyModuleRouter = router({
  getPoints: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(1, "رقم الهاتف مطلوب"),
        name: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getCustomerPoints(input.phone, input.name || "عميل");
    }),

  getHistory: protectedProcedure
    .input(z.object({ phone: z.string().min(1, "رقم الهاتف مطلوب") }))
    .query(async ({ input }) => {
      return await getPointsHistory(input.phone);
    }),

  getRewards: protectedProcedure
    .input(z.object({ phone: z.string().min(1, "رقم الهاتف مطلوب") }))
    .query(async ({ input }) => {
      return await getAvailableRewards(input.phone);
    }),

  redeemReward: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(1, "رقم الهاتف مطلوب"),
        rewardId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await redeemPoints(input.phone, input.rewardId);
    }),

  getStats: adminProcedure.query(async () => {
    return await getLoyaltyStats();
  }),

  getAllRewards: publicProcedure.query(async () => {
    return REWARDS;
  }),
});
