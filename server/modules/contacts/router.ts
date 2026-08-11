import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { audit, getReqMeta } from "../../_core/audit";
import { notifyOwner } from "../../_core/notification";
import { createContactMessage } from "../../db";

export const contactModuleRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "الاسم مطلوب"),
        phone: z.string().min(10, "رقم الهاتف غير صحيح"),
        email: z.string().email("البريد الإلكتروني غير صحيح"),
        message: z.string().min(10, "الرسالة قصيرة جداً"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createContactMessage(input);

      const meta = getReqMeta(ctx.req);
      audit({
        at: new Date().toISOString(),
        ...meta,
        actorId: ctx.user?.id ?? null,
        actorRole: ctx.user?.role ?? null,
        action: "contact.create",
        details: { name: input.name, phone: input.phone },
      });

      await notifyOwner({
        title: "💬 رسالة جديدة - مير",
        content: `
رسالة جديدة من: ${input.name}
الهاتف: ${input.phone}
البريد: ${input.email}
الرسالة: ${input.message}
        `.trim(),
      });

      return { success: true };
    }),
});
