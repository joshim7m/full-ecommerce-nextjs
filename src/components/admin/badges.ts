// =============================================================================
// Shared badge styling maps for order/product statuses
// =============================================================================

import type { OrderStatus, PaymentStatus, ProductStatus } from "@/lib/types";

export const ORDER_STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "border-amber-300 bg-amber-100 text-amber-800" },
  PROCESSING: { label: "Processing", className: "border-blue-300 bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Shipped", className: "border-purple-300 bg-purple-100 text-purple-800" },
  COMPLETED: { label: "Completed", className: "border-emerald-300 bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Cancelled", className: "border-rose-300 bg-rose-100 text-rose-800" },
};

export const PAYMENT_STATUS_BADGES: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Unpaid", className: "border-rose-300 bg-rose-100 text-rose-800" },
  PENDING: { label: "Pending", className: "border-amber-300 bg-amber-100 text-amber-800" },
  PAID: { label: "Paid", className: "border-emerald-300 bg-emerald-100 text-emerald-800" },
  REFUNDED: { label: "Refunded", className: "border-blue-300 bg-blue-100 text-blue-800" },
  FAILED: { label: "Failed", className: "border-rose-300 bg-rose-100 text-rose-800" },
};

export const PRODUCT_STATUS_BADGES: Record<ProductStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "border-muted bg-muted text-muted-foreground" },
  ACTIVE: { label: "Active", className: "border-emerald-300 bg-emerald-100 text-emerald-800" },
  OUT_OF_STOCK: { label: "Out of Stock", className: "border-rose-300 bg-rose-100 text-rose-800" },
  DISCONTINUED: { label: "Discontinued", className: "border-muted bg-muted text-muted-foreground" },
};

// Valid order status transitions (mirror of backend state machine)
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
