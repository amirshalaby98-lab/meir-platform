import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../../_core/trpc";
import { audit, getReqMeta } from "../../_core/audit";
import { notifyOwner } from "../../_core/notification";
import { createReview, getAllReviews, getApprovedReviews, updateReviewApproval } from "../../db";

export const reviewModuleRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "اسم المقيّم مطلوب"),
        rating: z.number().min(1).max(5, "التقييم يجب أن يكون بين 1 و5"),
        comment: z.string().min(10, "محتوى المراجعة قصير جداً").optional(),
        service: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createReview({
        ...input,
        approved: 0,
      });

      const meta = getReqMeta(ctx.req);
      audit({
        at: new Date().toISOString(),
        ...meta,
        actorId: ctx.user?.id ?? null,
        actorRole: ctx.user?.role ?? null,
        action: "review.create",
        details: { rating: input.rating, name: input.name },
      });

      await notifyOwner({
        title: "⭐ مراجعة جديدة - مير",
        content: `
مراجعة جديدة من: ${input.name}
التقييم: ${input.rating}/5 ⭐
        `.trim(),
      });

      return { success: true };
    }),

  getApproved: publicProcedure.query(async () => {
    return await getApprovedReviews();
  }),

  getAll: adminProcedure.query(async () => {
    return await getAllReviews();
  }),

  approve: adminProcedure
    .input(z.object({ id: z.number(), approved: z.number() }))
    .mutation(async ({ input }) => {
      await updateReviewApproval(input.id, input.approved);
      return { success: true };
    }),
});
