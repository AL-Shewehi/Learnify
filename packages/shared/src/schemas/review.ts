import { z } from "zod";

export const createReviewSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty")
      .max(1000, "Comment must be at most 1000 characters")
      .optional(),
  })
  .strict();

export const updateReviewSchema = createReviewSchema.partial().strict();

export const getReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z
    .enum(["newest", "oldest", "highest", "lowest"])
    .default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsQueryInput = z.infer<typeof getReviewsQuerySchema>;
