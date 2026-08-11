import { z } from "zod";
import { adminProcedure, router } from "../../_core/trpc";
import { createLogger } from "../../_core/logger";
import {
  getAllBookings,
  getAllContactMessages,
  getBookingById,
  updateBookingStatus,
} from "../../db";
import { deleteBooking, deleteMultipleBookings } from "../booking";
import {
  sendBookingCompletionSMS,
  sendBookingCancellationSMS,
  formatPhoneNumber,
} from "../sms";
import {
  awardPoints,
  POINTS_PER_BOOKING,
} from "../loyalty/repository";
import { getAllUsers, updateUserRole as updateUserRoleRepo } from "../users";
import { toSafeUser } from "../users/repository";

const log = createLogger("admin");

export const adminModuleRouter = router({
  getBookings: adminProcedure.query(async () => {
    return await getAllBookings();
  }),

  getMessages: adminProcedure.query(async () => {
    return await getAllContactMessages();
  }),

  updateBookingStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const booking = await getBookingById(input.id);
      await updateBookingStatus(input.id, input.status);

      if (booking) {
        const formattedPhone = formatPhoneNumber(booking.phone);

        if (input.status === "completed") {
          awardPoints(
            booking.phone,
            booking.name,
            POINTS_PER_BOOKING,
            `إتمام الحجز #${booking.id}`,
            booking.id
          ).catch((err) => log.error("Failed to award loyalty points", err));

          sendBookingCompletionSMS(
            formattedPhone,
            booking.name,
            booking.id
          ).catch((err) => log.error("Failed to send completion SMS", err));
        } else if (input.status === "cancelled") {
          sendBookingCancellationSMS(
            formattedPhone,
            booking.name,
            booking.id
          ).catch((err) => log.error("Failed to send cancellation SMS", err));
        }
      }

      return { success: true };
    }),

  // حذف حجز واحد
  deleteBooking: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBooking(input.id);
      log.info(`Booking ${input.id} deleted`);
      return { success: true };
    }),

  // حذف حجوزات متعددة
  deleteMultipleBookings: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      await deleteMultipleBookings(input.ids);
      log.info(`${input.ids.length} bookings deleted`);
      return { success: true };
    }),

  // جلب جميع المستخدمين
  getUsers: adminProcedure.query(async () => {
    const users = await getAllUsers();
    return users.map(toSafeUser);
  }),

  // تحديث دور المستخدم
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin", "technician"]),
    }))
    .mutation(async ({ input }) => {
      await updateUserRoleRepo(input.userId, input.role);

      log.info(`User ${input.userId} role updated to ${input.role}`);
      return { success: true };
    }),
});
