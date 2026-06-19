// =============================================================================
// Product Controller — HTTP handlers for /api/v1/products/*
// =============================================================================

import { type Request, type Response } from "express";
import {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  getBestSellers,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service";
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
} from "../validators/product.validator";

// -----------------------------------------------------------------------------
// GET /products
// Public — paginated list with filters
// -----------------------------------------------------------------------------

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListProductsQuery;
  const result = await listProducts(query);
  return sendPaginated(res, result.items, {
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
});

// -----------------------------------------------------------------------------
// GET /products/featured
// Public — featured products
// -----------------------------------------------------------------------------

export const featured = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 20) : 10;
  const items = await getFeaturedProducts(limit);
  return sendSuccess(res, items);
});

// -----------------------------------------------------------------------------
// GET /products/best-sellers
// Public — best sellers
// -----------------------------------------------------------------------------

export const bestSellers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 20) : 10;
  const items = await getBestSellers(limit);
  return sendSuccess(res, items);
});

// -----------------------------------------------------------------------------
// GET /products/:slug
// Public — single product by slug
// -----------------------------------------------------------------------------

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await getProductBySlug(slug);
  return sendSuccess(res, product);
});

// -----------------------------------------------------------------------------
// GET /products/:slug/related
// Public — related products
// -----------------------------------------------------------------------------

export const related = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 12) : 6;
  const items = await getRelatedProducts(slug, limit);
  return sendSuccess(res, items);
});

// -----------------------------------------------------------------------------
// POST /products
// Admin — create new product
// -----------------------------------------------------------------------------

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await createProduct(req.body as CreateProductInput);
  return sendCreated(res, product);
});

// -----------------------------------------------------------------------------
// PUT /products/:id
// Admin — update product
// -----------------------------------------------------------------------------

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await updateProduct(id, req.body as UpdateProductInput);
  return sendSuccess(res, product);
});

// -----------------------------------------------------------------------------
// DELETE /products/:id
// Admin — delete product (soft-delete if has order history)
// -----------------------------------------------------------------------------

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteProduct(id);
  return sendNoContent(res);
});
