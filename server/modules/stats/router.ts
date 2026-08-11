import { adminProcedure, router } from "../../_core/trpc";
import { getAllBookings, getAllReviews, getAllTechnicians } from "../../db";

export const statsModuleRouter = router({
  getDashboard: adminProcedure.query(async () => {
    const bookings = await getAllBookings();
    const reviews = await getAllReviews();
    const technicians = await getAllTechnicians();

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const completedBookings = bookings.filter((b) => b.status === "completed").length;

    const totalReviews = reviews.length;
    const approvedReviews = reviews.filter((r) => r.approved === 1).length;
    const averageRating =
      approvedReviews > 0
        ? reviews
            .filter((r) => r.approved === 1)
            .reduce((sum, r) => sum + r.rating, 0) / approvedReviews
        : 0;

    const totalTechnicians = technicians.length;
    const availableTechnicians = technicians.filter((t) => t.status === "available").length;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalReviews,
      approvedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalTechnicians,
      availableTechnicians,
    };
  }),
});
