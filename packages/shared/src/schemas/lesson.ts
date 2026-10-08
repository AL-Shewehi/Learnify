import { z } from "zod";

const lessonUrl = z
  .string()
  .trim()
  .regex(/^https?:\/\/.+/, "Must be a valid URL");

const sectionRef = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid section id")
  .nullable()
  .optional();

export const createLessonSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters"),
    description: z.string().trim().max(2000).optional(),
    type: z.enum(["video", "article"]),
    videoUrl: lessonUrl.optional(),
    articleBody: z.string().trim().optional(),
    duration: z
      .number()
      .int("Duration must be whole minutes")
      .min(1, "Duration must be at least 1 minute")
      .max(600, "Duration must be at most 600 minutes"),
    isPreview: z.boolean().optional(),
    sectionId: sectionRef,
  })
  .strict()
  .refine((d) => d.type !== "video" || Boolean(d.videoUrl), {
    message: "Video lessons require a video URL",
    path: ["videoUrl"],
  })
  .refine((d) => d.type !== "article" || Boolean(d.articleBody), {
    message: "Article lessons require content",
    path: ["articleBody"],
  });

export const updateLessonSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    type: z.enum(["video", "article"]).optional(),
    videoUrl: lessonUrl.optional(),
    articleBody: z.string().trim().optional(),
    duration: z.number().int().min(1).max(600).optional(),
    isPreview: z.boolean().optional(),
    sectionId: sectionRef,
  })
  .strict()
  .refine((d) => d.type !== "video" || Boolean(d.videoUrl), {
    message: "Video lessons require a video URL when changing type",
    path: ["videoUrl"],
  })
  .refine((d) => d.type !== "article" || Boolean(d.articleBody), {
    message: "Article lessons require content when changing type",
    path: ["articleBody"],
  });

export const reorderLessonsSchema = z
  .object({
    lessonIds: z
      .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid lesson id"))
      .min(1, "Provide the new order of lessons"),
  })
  .strict();

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
