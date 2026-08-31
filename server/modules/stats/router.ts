import { adminProcedure, router } from "../../_core/trpc";
import { getAllReviews } from "../../db";

export const statsModuleRouter = router({
  getDashboard: adminProcedure.query(async () => {
    const reviews = await getAllReviews();

    const totalReviews = reviews.length;
    const approvedReviews = reviews.filter((r) => r.approved === 1).length;
    const averageRating =
      approvedReviews > 0
        ? reviews
            .filter((r) => r.approved === 1)
            .reduce((sum, r) => sum + r.rating, 0) / approvedReviews
        : 0;

    return {
      totalReviews,
      approvedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }),
});
