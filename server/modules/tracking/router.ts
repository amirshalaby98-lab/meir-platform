import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getBookingById } from "../../db";

export const trackingModuleRouter = router({
  getBooking: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getBookingById(input.id);
    }),
});
