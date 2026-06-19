// =============================================================================
// Category Validators — Zod schemas for category CRUD
// =============================================================================

import { z } from "zod";

// -----------------------------------------------------------------------------
// Create category
// -----------------------------------------------------------------------------

export const createCategorySchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
    name: z.string().min(2).max(120),
    description: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional(),
    iconUrl: z.string().url().optional(),
    parentId: z.string().cuid().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional(),
  }),
});

// -----------------------------------------------------------------------------
// Update category — all fields optional, slug immutable
// -----------------------------------------------------------------------------

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(2000).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    iconUrl: z.string().url().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional(),
  }),
});

// -----------------------------------------------------------------------------
// List query params
// -----------------------------------------------------------------------------

export const listCategoriesQuerySchema = z.object({
  query: z.object({
    includeInactive: z.coerce.boolean().optional().default(false),
    includeProducts: z.coerce.boolean().optional().default(false),
    parentId: z.string().cuid().optional(),
  }),
});

// -----------------------------------------------------------------------------
// Slug param
// -----------------------------------------------------------------------------

export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(2).max(120),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
