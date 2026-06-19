// =============================================================================
// Category Controller — HTTP handlers for /api/v1/categories/*
// =============================================================================

import { type Request, type Response } from "express";
import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

// -----------------------------------------------------------------------------
// GET /categories
// Public — list all active categories (with optional product previews)
// -----------------------------------------------------------------------------

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { includeInactive, includeProducts, parentId } = req.query as {
    includeInactive?: string;
    includeProducts?: string;
    parentId?: string;
  };

  const categories = await listCategories({
    includeInactive: includeInactive === "true",
    includeProducts: includeProducts === "true",
    parentId,
  });

  return sendSuccess(res, categories);
});

// -----------------------------------------------------------------------------
// GET /categories/:slug
// Public — single category by slug
// -----------------------------------------------------------------------------

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const category = await getCategoryBySlug(slug);
  return sendSuccess(res, category);
});

// -----------------------------------------------------------------------------
// POST /categories
// Admin — create new category
// -----------------------------------------------------------------------------

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await createCategory(req.body as CreateCategoryInput);
  return sendCreated(res, category);
});

// -----------------------------------------------------------------------------
// PUT /categories/:slug
// Admin — update category by slug
// -----------------------------------------------------------------------------

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const category = await updateCategory(slug, req.body as UpdateCategoryInput);
  return sendSuccess(res, category);
});

// -----------------------------------------------------------------------------
// DELETE /categories/:slug
// Admin — delete category by slug (blocks if has products)
// -----------------------------------------------------------------------------

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  await deleteCategory(slug);
  return sendNoContent(res);
});
