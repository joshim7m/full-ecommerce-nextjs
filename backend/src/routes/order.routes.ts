// =============================================================================
// Order Routes — /api/v1/orders/*
// =============================================================================

import { Router } from "express";
import {
  create,
  list,
  getById,
  stats,
  updateStatus,
} from "../controllers/order.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from "../validators/order.validator";

export const orderRouter = Router();

// -----------------------------------------------------------------------------
// Public — guest checkout supported
// -----------------------------------------------------------------------------

orderRouter.post("/", validate(createOrderSchema, "body"), create);

// -----------------------------------------------------------------------------
// Authenticated — user can see their own orders
// -----------------------------------------------------------------------------

orderRouter.get(
  "/",
  authenticate,
  validate(listOrdersQuerySchema, "query"),
  list,
);

orderRouter.get(
  "/:id",
  authenticate,
  validate(orderIdParamSchema, "params"),
  getById,
);

// -----------------------------------------------------------------------------
// Admin-only — stats + status updates
// -----------------------------------------------------------------------------

orderRouter.get("/stats", authenticate, requireAdmin, stats);

orderRouter.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  updateStatus,
);
