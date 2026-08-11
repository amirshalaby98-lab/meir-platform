import { z } from "zod";
import { adminProcedure, router } from "../../_core/trpc";
import { getAllUsers, getUserById, updateUserRole, toggleUserActive } from "../../db";

export const usersModuleRouter = router({
  getAll: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getUserById(input.id);
    }),

  updateRole: adminProcedure
    .input(z.object({ id: z.number(), role: z.string() }))
    .mutation(async ({ input }) => {
      return await updateUserRole(input.id, input.role);
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.number().int().positive(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await toggleUserActive(input.id, input.isActive);
      return { success: true } as const;
    }),
});
