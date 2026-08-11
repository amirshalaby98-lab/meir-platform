import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { audit, getReqMeta } from "../../_core/audit";
import { notifyOwner } from "../../_core/notification";
import { createBooking, getBookingById } from "../../db";
import {
  sendBookingConfirmationSMS,
  formatPhoneNumber,
} from "../../sms";
import { createLogger } from "../../_core/logger";

const log = createLogger("booking");

export const bookingModuleRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "الاسم مطلوب"),
        phone: z.string().min(10, "رقم الهاتف غير صحيح"),
        email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
        service: z.string().min(1, "يجب اختيار الخدمة"),
        location: z.string().min(1, "يجب اختيار الموقع"),
        date: z.string().min(1, "التاريخ مطلوب"),
        time: z.string().min(1, "الوقت مطلوب"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const booking = await createBooking({
        ...input,
        email: input.email || null,
        notes: input.notes || null,
      });

      const meta = getReqMeta(ctx.req);
      audit({
        at: new Date().toISOString(),
        ...meta,
        actorId: ctx.user?.id ?? null,
        actorRole: ctx.user?.role ?? null,
        action: "booking.create",
        details: { service: input.service, location: input.location, date: input.date, time: input.time },
      });

      const formattedPhone = formatPhoneNumber(input.phone);
      sendBookingConfirmationSMS(
        formattedPhone,
        input.name,
        booking.id,
        input.service,
        input.date,
        input.time
      ).catch((err) => log.error("Failed to send booking confirmation SMS", err));

      await notifyOwner({
        title: "🔔 حجز جديد - مير",
        content: `
حجز جديد من: ${input.name}
الهاتف: ${input.phone}
الخدمة: ${input.service}
الموقع: ${input.location}
التاريخ: ${input.date}
الوقت: ${input.time}
${input.notes ? `ملاحظات: ${input.notes}` : ""}
        `.trim(),
      });

      return { success: true };
    }),
});
