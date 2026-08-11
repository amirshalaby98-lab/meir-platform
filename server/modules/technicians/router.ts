import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { createLogger } from "../../_core/logger";
import {
  getAllTechnicians,
  getTechnicianById,
  getAvailableTechnicians,
  createTechnician,
  updateTechnicianStatus,
  assignTechnicianToBooking,
  getTechnicianBookings,
  getTechnicianStats,
  getBookingById,
  updateBookingStatus,
} from "../../db";
import { updateTechnicianInfo, registerTechnician, getTechnicianByUserId, getPendingTechnicians, approveTechnician, rejectTechnician } from "./repository";
import {
  sendTechnicianAssignmentSMS,
  formatPhoneNumber,
} from "../../sms";
import { notifyOwner } from "../../_core/notification";

const log = createLogger("technician");

export const technicianModuleRouter = router({
  getAll: publicProcedure.query(async () => {
    return await getAllTechnicians();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getTechnicianById(input.id);
    }),

  getAvailable: publicProcedure
    .input(z.object({ location: z.string() }))
    .query(async ({ input }) => {
      return await getAvailableTechnicians(input.location);
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "يجب إدخال الاسم"),
        phone: z.string().min(10, "رقم الهاتف غير صحيح"),
        email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
        specialization: z.string().optional(),
        location: z.string().min(1, "يجب اختيار الموقع"),
      })
    )
    .mutation(async ({ input }) => {
      await createTechnician(input);
      return { success: true };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["available", "busy", "offline"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateTechnicianStatus(input.id, input.status);
      return { success: true };
    }),

  assignToBooking: adminProcedure
    .input(
      z.object({
        bookingId: z.number(),
        technicianId: z.number(),
        technicianName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await assignTechnicianToBooking(
        input.bookingId,
        input.technicianId,
        input.technicianName
      );
      await updateBookingStatus(input.bookingId, "confirmed");

      const booking = await getBookingById(input.bookingId);
      const technician = await getTechnicianById(input.technicianId);

      if (booking && technician) {
        const formattedPhone = formatPhoneNumber(booking.phone);
        sendTechnicianAssignmentSMS(
          formattedPhone,
          booking.name,
          technician.name,
          technician.phone,
          booking.date,
          booking.time
        ).catch((err) => log.error("Failed to send technician assignment SMS", err));
      }

      return { success: true };
    }),

  getBookings: protectedProcedure
    .input(z.object({ technicianId: z.number() }))
    .query(async ({ input }) => {
      return await getTechnicianBookings(input.technicianId);
    }),

  getStats: adminProcedure
    .input(z.object({ technicianId: z.number() }))
    .query(async ({ input }) => {
      return await getTechnicianStats(input.technicianId);
    }),

  updateInfo: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      specialty: z.string().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateTechnicianInfo(id, data);
      return { success: true };
    }),

  // تسجيل فني جديد (protected - المستخدم المسجل فقط)
  register: protectedProcedure
    .input(z.object({
      name: z.string().min(3, "يجب إدخال الاسم الكامل"),
      phone: z.string().min(10, "رقم الهاتف غير صحيح"),
      nationalId: z.string().min(10, "رقم الهوية غير صحيح").max(10, "رقم الهوية غير صحيح"),
      specialization: z.string().min(1, "يجب اختيار التخصص"),
      yearsExperience: z.number().min(0).max(50),
      location: z.string().min(1, "يجب اختيار المنطقة"),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const email = ctx.user.email || undefined;

      // التحقق من عدم وجود تسجيل سابق
      const existing = await getTechnicianByUserId(userId);
      if (existing) {
        return { success: false, message: "لديك طلب تسجيل سابق", status: existing.approvalStatus };
      }

      await registerTechnician({
        userId,
        name: input.name,
        phone: input.phone,
        email,
        nationalId: input.nationalId,
        specialization: input.specialization,
        yearsExperience: input.yearsExperience,
        location: input.location,
      });

      log.info(`New technician registration: ${input.name} (userId: ${userId})`);

      // إرسال إشعار للأدمن
      notifyOwner({
        title: "🔧 طلب تسجيل فني جديد",
        content: `فني جديد يطلب الانضمام:\nالاسم: ${input.name}\nالتخصص: ${input.specialization}\nالخبرة: ${input.yearsExperience} سنة\nالمنطقة: ${input.location}\nالجوال: ${input.phone}\n\nافتح لوحة الإدارة للموافقة أو الرفض.`,
      }).catch((err) => log.error("Failed to notify owner about new technician", err));

      return { success: true, message: "تم إرسال طلبك بنجاح، سيتم مراجعته من الإدارة" };
    }),

  // التحقق من حالة تسجيل الفني
  getMyRegistration: protectedProcedure
    .query(async ({ ctx }) => {
      const tech = await getTechnicianByUserId(ctx.user.id);
      if (!tech) return { registered: false, status: null };
      return { registered: true, status: tech.approvalStatus, technician: tech };
    }),

  // طلبات الفنيين المعلقة (أدمن فقط)
  getPending: adminProcedure
    .query(async () => {
      return await getPendingTechnicians();
    }),

  // موافقة على فني (أدمن فقط)
  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await approveTechnician(input.id);
      log.info(`Technician ${input.id} approved`);
      return { success: true };
    }),

  // رفض فني (أدمن فقط)
  reject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await rejectTechnician(input.id);
      log.info(`Technician ${input.id} rejected`);
      return { success: true };
    }),
});
