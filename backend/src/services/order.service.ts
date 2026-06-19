// =============================================================================
// Order Service — creation, listing, status state machine, stock management
// -----------------------------------------------------------------------------
// Order state machine (admin-controlled):
//
//   PENDING ─────► PROCESSING ─────► SHIPPED ─────► COMPLETED
//      │                │                │
//      └────────────────┴────────────────┴──► CANCELLED
//
// Rules:
//   • PENDING → PROCESSING, CANCELLED
//   • PROCESSING → SHIPPED, CANCELLED
//   • SHIPPED → COMPLETED, CANCELLED (rare — e.g. returned to sender)
//   • COMPLETED → (terminal — cannot transition)
//   • CANCELLED → (terminal — cannot transition)
//
// On CANCELLED: stock is returned to inventory (added back).
// On SHIPPED: tracking number + courier recorded.
// =============================================================================

import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { AppError } from "../utils/api-response";
import { bdtToPaisa, multiplyPaisa, sumPaisa, paisaToBdt } from "../utils/paisa";
import { generateOrderNumber } from "../utils/order-number";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  ListOrdersQuery,
} from "../validators/order.validator";

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  unitPriceBdt: number;
  quantity: number;
  lineTotalBdt: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  note: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotalBdt: number;
  shippingCostBdt: number;
  discountBdt: number;
  totalBdt: number;
  trackingNumber: string | null;
  courierName: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemDto[];
}

export interface OrderListResult {
  items: OrderDto[];
  total: number;
}

// -----------------------------------------------------------------------------
// Valid state transitions
// -----------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// Flat shipping cost inside Dhaka — outside Dhaka. Could be lifted to a
// config table later. For Phase 2 we hard-code and surface in admin settings.
const SHIPPING_COST_INSIDE_DHAKA_BDT = 60;
const SHIPPING_COST_OUTSIDE_DHAKA_BDT = 120;

// -----------------------------------------------------------------------------
// CREATE — guest or authenticated user order
// -----------------------------------------------------------------------------

export async function createOrder(
  input: CreateOrderInput,
  userId?: string,
): Promise<OrderDto> {
  // 1. Validate all products exist + have sufficient stock + compute totals
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      slug: true,
      name: true,
      pricePaisa: true,
      stock: true,
      status: true,
      visibility: true,
      images: true,
    },
  });

  if (products.length !== productIds.length) {
    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    throw AppError.badRequest("Some products were not found", { missing });
  }

  // Check stock availability for each line item
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    if (product.status !== "ACTIVE" || product.visibility !== "PUBLISHED") {
      throw AppError.badRequest(`Product "${product.name}" is not available for purchase`);
    }
    if (product.stock < item.quantity) {
      throw AppError.conflict(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
        { productId: product.id, available: product.stock, requested: item.quantity },
      );
    }
  }

  // 2. Build line items + compute subtotal
  const orderItems: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string | null;
    unitPricePaisa: bigint;
    quantity: number;
    lineTotalPaisa: bigint;
  }> = [];

  let subtotalPaisa = 0n;
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPricePaisa = product.pricePaisa;
    const lineTotalPaisa = multiplyPaisa(unitPricePaisa, item.quantity);
    subtotalPaisa = sumPaisa(subtotalPaisa, lineTotalPaisa);

    const images = Array.isArray(product.images) ? (product.images as string[]) : [];

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: images[0] ?? null,
      unitPricePaisa,
      quantity: item.quantity,
      lineTotalPaisa,
    });
  }

  // 3. Apply coupon if provided
  let discountPaisa = 0n;
  let appliedCouponCode: string | null = null;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode },
    });

    if (!coupon || !coupon.isActive) {
      throw AppError.badRequest("Invalid or inactive coupon code");
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw AppError.badRequest("Coupon is not yet active");
    }
    if (coupon.endsAt && now > coupon.endsAt) {
      throw AppError.badRequest("Coupon has expired");
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw AppError.badRequest("Coupon usage limit reached");
    }
    if (coupon.minOrderPaisa && subtotalPaisa < coupon.minOrderPaisa) {
      throw AppError.badRequest(
        `Coupon requires minimum order of ৳${paisaToBdt(coupon.minOrderPaisa)}`,
      );
    }

    if (coupon.discountType === "PERCENTAGE") {
      discountPaisa = (subtotalPaisa * BigInt(coupon.discountValue)) / 100n;
      if (coupon.maxDiscountPaisa && discountPaisa > coupon.maxDiscountPaisa) {
        discountPaisa = coupon.maxDiscountPaisa;
      }
    } else if (coupon.discountType === "FIXED") {
      discountPaisa = BigInt(coupon.discountValue);
    }

    appliedCouponCode = coupon.code;
  }

  // 4. Compute shipping cost
  // Simple heuristic: if address contains "Dhaka" → inside-Dhaka rate, else outside.
  const addressLower = input.shippingAddress.toLowerCase();
  const insideDhaka = addressLower.includes("dhaka");
  const shippingCostBdt = insideDhaka
    ? SHIPPING_COST_INSIDE_DHAKA_BDT
    : SHIPPING_COST_OUTSIDE_DHAKA_BDT;
  const shippingCostPaisa = bdtToPaisa(shippingCostBdt);

  // 5. Compute total
  const totalPaisa = subtotalPaisa - discountPaisa + shippingCostPaisa;

  // 6. Generate order number
  const orderNumber = await generateOrderNumber();

  // 7. Create order + decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        shippingAddress: input.shippingAddress,
        note: input.note,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: input.paymentMethod,
        subtotalPaisa,
        shippingCostPaisa,
        discountPaisa,
        totalPaisa,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            productImage: item.productImage,
            unitPricePaisa: item.unitPricePaisa,
            quantity: item.quantity,
            lineTotalPaisa: item.lineTotalPaisa,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock for each product + increment salesCount
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      });
    }

    // Increment coupon usage if applied
    if (appliedCouponCode) {
      await tx.coupon.update({
        where: { code: appliedCouponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  // 8. Invalidate product cache (stock changed, best-seller order may change)
  await invalidateProductCacheAfterOrder();

  logger.info(`Order created: ${order.orderNumber} (${order.id}) — ৳${paisaToBdt(totalPaisa)}`);

  return toDto(order);
}

// -----------------------------------------------------------------------------
// LIST — admin sees all, user sees only their own
// -----------------------------------------------------------------------------

export async function listOrders(
  query: ListOrdersQuery,
  userId?: string,
  isAdmin = false,
): Promise<OrderListResult> {
  const where: Prisma.OrderWhereInput = {};

  // Non-admin users can only see their own orders
  if (!isAdmin) {
    if (!userId) {
      throw AppError.unauthorized("Authentication required to view orders");
    }
    where.userId = userId;
  }

  if (query.status) where.status = query.status;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search, mode: "insensitive" } },
      { customerName: { contains: query.search, mode: "insensitive" } },
      { customerPhone: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt.gte = new Date(query.startDate);
    if (query.endDate) where.createdAt.lte = new Date(query.endDate);
  }

  const orderBy: Prisma.OrderOrderByWithRelationInput =
    query.sort === "oldest"
      ? { createdAt: "asc" }
      : query.sort === "total_asc"
        ? { totalPaisa: "asc" }
        : query.sort === "total_desc"
          ? { totalPaisa: "desc" }
          : { createdAt: "desc" };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: orders.map(toDto),
    total,
  };
}

// -----------------------------------------------------------------------------
// GET BY ID — admin sees any, user sees only their own
// -----------------------------------------------------------------------------

export async function getOrderById(id: string, userId?: string, isAdmin = false): Promise<OrderDto> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw AppError.notFound(`Order with id "${id}" not found`);
  }

  if (!isAdmin && order.userId !== userId) {
    throw AppError.forbidden("You can only view your own orders");
  }

  return toDto(order);
}

// -----------------------------------------------------------------------------
// UPDATE STATUS — admin only, with state machine validation
// -----------------------------------------------------------------------------

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
): Promise<OrderDto> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw AppError.notFound(`Order with id "${id}" not found`);
  }

  const currentStatus = order.status;
  const newStatus = input.status;

  // Validate transition
  if (currentStatus === newStatus) {
    throw AppError.badRequest(`Order is already in status ${currentStatus}`);
  }

  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(
      `Invalid status transition: ${currentStatus} → ${newStatus}. Valid transitions from ${currentStatus}: ${allowed.join(", ") || "(none — terminal state)"}`,
      { currentStatus, attemptedStatus: newStatus, allowed },
    );
  }

  // For SHIPPED status, require tracking info
  if (newStatus === "SHIPPED" && !input.trackingNumber && !order.trackingNumber) {
    throw AppError.badRequest("Tracking number is required when shipping an order");
  }

  // Update with timestamps
  const updateData: Prisma.OrderUpdateInput = {
    status: newStatus,
  };

  if (input.trackingNumber) updateData.trackingNumber = input.trackingNumber;
  if (input.courierName) updateData.courierName = input.courierName;

  if (newStatus === "SHIPPED") {
    updateData.shippedAt = new Date();
    updateData.paymentStatus = "PENDING";
  } else if (newStatus === "COMPLETED") {
    updateData.deliveredAt = new Date();
    updateData.paymentStatus = "PAID";
  } else if (newStatus === "CANCELLED") {
    updateData.cancelledAt = new Date();
    // COD orders stay unpaid; prepaid orders would need refund flow (out of scope)
  }

  // If cancelling, return stock to inventory
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    if (newStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            salesCount: { decrement: item.quantity },
          },
        });
      }
      logger.info(`Order ${order.orderNumber} cancelled — stock returned for ${order.items.length} items`);
    }

    return result;
  });

  await invalidateProductCacheAfterOrder();

  logger.info(
    `Order ${updated.orderNumber} status: ${currentStatus} → ${newStatus}`,
  );

  return toDto(updated);
}

// -----------------------------------------------------------------------------
// GET STATS — admin dashboard summary
// -----------------------------------------------------------------------------

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  totalRevenueBdt: number;
  totalOrdersToday: number;
  averageOrderValueBdt: number;
}

export async function getOrderStats(): Promise<OrderStats> {
  const [
    total,
    pending,
    processing,
    shipped,
    completed,
    cancelled,
    revenueResult,
    todayCount,
    aovResult,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({
      where: { status: { in: ["COMPLETED", "SHIPPED"] } },
      _sum: { totalPaisa: true },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.aggregate({
      _avg: { totalPaisa: true },
      _count: true,
    }),
  ]);

  return {
    total,
    pending,
    processing,
    shipped,
    completed,
    cancelled,
    totalRevenueBdt: revenueResult._sum.totalPaisa
      ? paisaToBdt(revenueResult._sum.totalPaisa)
      : 0,
    totalOrdersToday: todayCount,
    averageOrderValueBdt: aovResult._avg.totalPaisa
      ? paisaToBdt(aovResult._avg.totalPaisa)
      : 0,
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function invalidateProductCacheAfterOrder(): Promise<void> {
  // Importing here to avoid a circular import at module load
  const { cache } = await import("../config/redis");
  await cache.delByPattern("products:*");
}

function toDto(order: Prisma.OrderGetPayload<{ include: { items: true } }>): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    note: order.note,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotalBdt: paisaToBdt(order.subtotalPaisa),
    shippingCostBdt: paisaToBdt(order.shippingCostPaisa),
    discountBdt: paisaToBdt(order.discountPaisa),
    totalBdt: paisaToBdt(order.totalPaisa),
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productSlug: i.productSlug,
      productImage: i.productImage,
      unitPriceBdt: paisaToBdt(i.unitPricePaisa),
      quantity: i.quantity,
      lineTotalBdt: paisaToBdt(i.lineTotalPaisa),
    })),
  };
}
