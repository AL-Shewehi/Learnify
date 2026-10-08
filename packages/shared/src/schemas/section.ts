import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createSectionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be at most 100 characters"),
  })
  .strict();

export const updateSectionSchema = createSectionSchema.partial().strict();

export const reorderSectionsSchema = z
  .object({
    sectionIds: z
      .array(objectId)
      .min(1, "Provide the new order of sections"),
  })
  .strict();

export const sectionIdSchema = z.object({
  sectionId: objectId.nullable().optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
