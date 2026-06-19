// =============================================================================
// Order Validators — Zod schemas for order creation + status transitions
// =============================================================================

import { z } from "zod";

// -----------------------------------------------------------------------------
// Order item input (from cart)
// -----------------------------------------------------------------------------

export const orderItemInputSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
});

// -----------------------------------------------------------------------------
// Create order — Bangla-optimized 4-field checkout
//   1. Full Name
//   2. Mobile Number
//   3. Delivery Address
//   4. Note / Special Instructions
// -----------------------------------------------------------------------------

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(120),
    customerPhone: z
      .string()
      .regex(/^(\+?880|0)?1[3-9][0-9]{8}$/, "Must be a valid Bangladeshi mobile number (e.g. 017XXXXXXXX or +88017XXXXXXXX)"),
    customerEmail: z.string().email().optional(),
    shippingAddress: z
      .string()
      .min(10, "Delivery address must be at least 10 characters")
      .max(500),
    note: z.string().max(500).optional(),
    paymentMethod: z
      .enum(["CASH_ON_DELIVERY", "BKASH", "NAGAD", "ROCKET", "CARD"])
      .optional()
      .default("CASH_ON_DELIVERY"),
    items: z.array(orderItemInputSchema).min(1, "Order must contain at least one item"),
    couponCode: z.string().max(60).optional(),
  }),
});

// -----------------------------------------------------------------------------
// Update order status — admin state machine
// -----------------------------------------------------------------------------

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]),
    trackingNumber: z.string().max(120).optional(),
    courierName: z.string().max(120).optional(),
    note: z.string().max(500).optional(),
  }),
});

// -----------------------------------------------------------------------------
// List orders query — pagination + filters
// -----------------------------------------------------------------------------

export const listOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z
      .enum(["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"])
      .optional(),
    paymentStatus: z
      .enum(["UNPAID", "PENDING", "PAID", "REFUNDED", "FAILED"])
      .optional(),
    search: z.string().max(200).optional(), // search by orderNumber, phone, name
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sort: z
      .enum(["newest", "oldest", "total_asc", "total_desc"])
      .optional()
      .default("newest"),
  }),
});

// -----------------------------------------------------------------------------
// Order ID param
// -----------------------------------------------------------------------------

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>["body"];
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>["query"];
