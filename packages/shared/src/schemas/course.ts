import { z } from "zod";
import { COURSE_LEVELS, COURSE_SUBJECTS } from "../constants/index.js";

export const createCourseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters")
      .optional(),
    coverImage: z
      .string()
      .regex(/^https?:\/\/.+/, "Invalid image URL")
      .optional(),
    price: z.number().min(0, "Price must be a positive number"),
    subject: z.enum(COURSE_SUBJECTS),
    level: z.enum(["beginner", "intermediate", "advanced"]),
  })
  .strict();

export const updateCourseSchema = createCourseSchema.partial();

export const COURSE_SORT_OPTIONS = [
  "-createdAt",
  "createdAt",
  "-totalStudents",
  "-rating",
  "price",
  "-price",
] as const;

export const getCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  subject: z.enum(COURSE_SUBJECTS).optional(),
  level: z.enum(COURSE_LEVELS).optional(),
  sort: z.enum(COURSE_SORT_OPTIONS).default("-createdAt"),
  search: z.string().max(100).optional(),
});

export const suspendCourseSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(10, "Suspension reason must be at least 10 characters")
      .max(500, "Suspension reason must be at most 500 characters"),
  })
  .strict();

// Inferred types
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>;
export type SuspendCourseInput = z.infer<typeof suspendCourseSchema>;
