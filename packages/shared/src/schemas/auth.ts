import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["student", "instructor"]).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({ email: z.string().trim().toLowerCase().email() })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current Password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "New Password must be at least 8 characters"),
    confirmNewPassword: z
      .string()
      .min(8, "Confirm New Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(3).max(50).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
  })
  .strict()
  .refine((d) => d.name !== undefined || d.email !== undefined, {
    message: "Please provide at least one field to update",
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
