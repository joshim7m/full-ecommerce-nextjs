// =============================================================================
// Order Controller — HTTP handlers for /api/v1/orders/*
// =============================================================================

import { type Request, type Response } from "express";
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from "../services/order.service";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  ListOrdersQuery,
} from "../validators/order.validator";

// -----------------------------------------------------------------------------
// POST /orders
// Public (guest checkout) or authenticated — creates a new order
// -----------------------------------------------------------------------------

export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await createOrder(req.body as CreateOrderInput, req.user?.id);
  return sendCreated(res, order);
});

// -----------------------------------------------------------------------------
// GET /orders
// Authenticated user — lists their own orders
// Admin — lists all orders with filters
// -----------------------------------------------------------------------------

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListOrdersQuery;
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "MANAGER";
  const result = await listOrders(query, req.user?.id, isAdmin);
  return sendPaginated(res, result.items, {
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
});

// -----------------------------------------------------------------------------
// GET /orders/:id
// Authenticated user — gets their own order
// Admin — gets any order
// -----------------------------------------------------------------------------

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "MANAGER";
  const order = await getOrderById(id, req.user?.id, isAdmin);
  return sendSuccess(res, order);
});

// -----------------------------------------------------------------------------
// GET /orders/stats
// Admin — dashboard stats
// -----------------------------------------------------------------------------

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getOrderStats();
  return sendSuccess(res, result);
});

// -----------------------------------------------------------------------------
// PATCH /orders/:id/status
// Admin — updates order status (state-machine-validated)
// -----------------------------------------------------------------------------

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await updateOrderStatus(id, req.body as UpdateOrderStatusInput);
  return sendSuccess(res, order);
});
