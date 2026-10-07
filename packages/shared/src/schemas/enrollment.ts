import { z } from "zod";
import { ENROLLMENT_STATUSES } from "../constants/index.js";

export const createEnrollmentSchema = z
  .object({
    couponCode: z.string().trim().optional(),
  })
  .strict();

export const updateProgressSchema = z
  .object({
    progress: z
      .number()
      .int("Progress must be an integer")
      .min(0, "Progress cannot be negative")
      .max(100, "Progress cannot exceed 100"),
  })
  .strict();

export const getMyEnrollmentsQuerySchema = z.object({
  status: z.enum(ENROLLMENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const getCourseEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Inferred types
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type GetMyEnrollmentsQuery = z.infer<typeof getMyEnrollmentsQuerySchema>;
export type GetCourseEnrollmentsQuery = z.infer<
  typeof getCourseEnrollmentsQuerySchema
>;