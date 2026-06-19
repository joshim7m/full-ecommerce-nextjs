// =============================================================================
// Product Validators — Zod schemas for product CRUD + listing filters
// =============================================================================

import { z } from "zod";

// -----------------------------------------------------------------------------
// Create product
// -----------------------------------------------------------------------------

export const createProductSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(2)
      .max(160)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
    name: z.string().min(2).max(255),
    shortDescription: z.string().max(300).optional(),
    description: z.string().max(10000).optional(),
    priceBdt: z.number().positive("Price must be positive"),
    compareAtBdt: z.number().positive().optional(),
    costBdt: z.number().positive().optional(),
    sku: z.string().min(2).max(64).optional(),
    barcode: z.string().max(64).optional(),
    stock: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).max(10000).optional(),
    weightGrams: z.number().int().min(0).max(1000000).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
    visibility: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    categoryId: z.string().cuid(),
    images: z.array(z.string().url()).max(10).default([]),
    keyFeatures: z.array(z.string().max(300)).max(20).default([]),
    tags: z.array(z.string().max(60)).max(30).default([]),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

// -----------------------------------------------------------------------------
// Update product
// -----------------------------------------------------------------------------

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    shortDescription: z.string().max(300).optional().nullable(),
    description: z.string().max(10000).optional().nullable(),
    priceBdt: z.number().positive().optional(),
    compareAtBdt: z.number().positive().optional().nullable(),
    costBdt: z.number().positive().optional().nullable(),
    sku: z.string().min(2).max(64).optional(),
    barcode: z.string().max(64).optional().nullable(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).max(10000).optional(),
    weightGrams: z.number().int().min(0).max(1000000).optional().nullable(),
    status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
    visibility: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    categoryId: z.string().cuid().optional(),
    images: z.array(z.string().url()).max(10).optional(),
    keyFeatures: z.array(z.string().max(300)).max(20).optional(),
    tags: z.array(z.string().max(60)).max(30).optional(),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

// -----------------------------------------------------------------------------
// Product list query — pagination + filters + sorting
// -----------------------------------------------------------------------------

export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(60).default(20),
    categoryId: z.string().cuid().optional(),
    categorySlug: z
      .string()
      .min(2)
      .max(120)
      .optional(),
    slug: z.string().min(2).max(120).optional(),
    search: z.string().min(1).max(200).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
    visibility: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isBestSeller: z.coerce.boolean().optional(),
    minPriceBdt: z.coerce.number().min(0).optional(),
    maxPriceBdt: z.coerce.number().min(0).optional(),
    tags: z
      .string()
      .optional()
      .transform((v) => (v ? v.split(",").map((t) => t.trim()).filter(Boolean) : undefined)),
    sort: z
      .enum(["newest", "price_asc", "price_desc", "name_asc", "name_desc", "best_selling", "top_rated"])
      .optional()
      .default("newest"),
    includeInactive: z.coerce.boolean().optional().default(false),
  }),
});

// -----------------------------------------------------------------------------
// Product slug param
// -----------------------------------------------------------------------------

export const productSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(2).max(160),
  }),
});

// -----------------------------------------------------------------------------
// Product ID param (admin endpoints)
// -----------------------------------------------------------------------------

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>["query"];
