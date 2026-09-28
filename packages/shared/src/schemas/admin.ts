import { z } from "zod";
import { USER_ROLES } from "../constants/index.js";

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(USER_ROLES).optional(),
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const updateUserRoleSchema = z
  .object({ role: z.enum(USER_ROLES) })
  .strict();

export const toggleUserActiveSchema = z
  .object({ isActive: z.boolean() })
  .strict();

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;