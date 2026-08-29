import { z } from "zod";

export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens.");

export const idParamSchema = z.object({ id: z.string().min(1) });

export const noteIdParamSchema = z.object({ noteId: z.string().min(1) });

export const optionalPaginationSchema = z.object({
  take: z.coerce.number().int().positive().max(100).optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

export const stringField = (max = 500) => z.string().trim().min(1).max(max);
export const optionalStringField = (max = 500) => z.string().trim().max(max).optional();
export const moneySchema = z.coerce.number().nonnegative();
