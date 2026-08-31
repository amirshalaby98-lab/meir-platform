import { z } from "zod";
import { adminProcedure, router } from "../../_core/trpc";
import { createLogger } from "../../_core/logger";
import { getAllContactMessages } from "../../db";
import { getAllUsers, updateUserRole as updateUserRoleRepo } from "../users";
import { toSafeUser } from "../users/repository";

const log = createLogger("admin");

export const adminModuleRouter = router({
  getMessages: adminProcedure.query(async () => {
    return await getAllContactMessages();
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
