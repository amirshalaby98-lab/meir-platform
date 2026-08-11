import { z } from "zod";
import { adminProcedure, router } from "../../_core/trpc";
import { getAllUsers, getUserById, updateUserRole, toggleUserActive } from "../../db";
import { toSafeUser } from "./repository";

export const usersModuleRouter = router({
  getAll: adminProcedure.query(async () => {
    const users = await getAllUsers();
    return users.map(toSafeUser);
  }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      return user ? toSafeUser(user) : user;
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
