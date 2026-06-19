// =============================================================================
// Product Routes — /api/v1/products/*
// =============================================================================

import { Router } from "express";
import {
  list,
  featured,
  bestSellers,
  getBySlug,
  related,
  create,
  update,
  remove,
} from "../controllers/product.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  productSlugParamSchema,
  productIdParamSchema,
} from "../validators/product.validator";

export const productRouter = Router();

// -----------------------------------------------------------------------------
// Public routes — order matters: define specific routes BEFORE /:slug
// -----------------------------------------------------------------------------

productRouter.get("/", validate(listProductsQuerySchema, "query"), list);
productRouter.get("/featured", featured);
productRouter.get("/best-sellers", bestSellers);
productRouter.get("/:slug", validate(productSlugParamSchema, "params"), getBySlug);
productRouter.get(
  "/:slug/related",
  validate(productSlugParamSchema, "params"),
  related,
);

// -----------------------------------------------------------------------------
// Admin-only routes
// -----------------------------------------------------------------------------

productRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createProductSchema, "body"),
  create,
);

productRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(productIdParamSchema, "params"),
  validate(updateProductSchema, "body"),
  update,
);

productRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(productIdParamSchema, "params"),
  remove,
);
