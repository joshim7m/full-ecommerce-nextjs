// =============================================================================
// Category Routes — /api/v1/categories/*
// =============================================================================

import { Router } from "express";
import { list, getBySlug, create, update, remove } from "../controllers/category.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
  categorySlugParamSchema,
} from "../validators/category.validator";

export const categoryRouter = Router();

// -----------------------------------------------------------------------------
// Public routes
// -----------------------------------------------------------------------------

categoryRouter.get("/", list);
categoryRouter.get("/:slug", validate(categorySlugParamSchema, "params"), getBySlug);

// -----------------------------------------------------------------------------
// Admin-only routes
// -----------------------------------------------------------------------------

categoryRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createCategorySchema, "body"),
  create,
);

categoryRouter.put(
  "/:slug",
  authenticate,
  requireAdmin,
  validate(categorySlugParamSchema, "params"),
  validate(updateCategorySchema, "body"),
  update,
);

categoryRouter.delete(
  "/:slug",
  authenticate,
  requireAdmin,
  validate(categorySlugParamSchema, "params"),
  remove,
);
