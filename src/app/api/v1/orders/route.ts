import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) return apiError("Forbidden", 403);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.order.count(),
    ]);

    return apiSuccess({ success: true, data: orders, total, page, limit });
  } catch (err) {
    console.error("Orders list error:", err);
    return apiError("Failed to fetch orders", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, shippingAddress, items, paymentMethod } = body as {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      shippingAddress: string;
      items: Array<{ productId: string; quantity: number }>;
      paymentMethod?: string;
    };

    if (!customerName || !customerPhone || !shippingAddress || !items?.length) {
      return apiError("Missing required fields", 400);
    }

    let subtotalPaisa = 0;
    const orderItems: Array<{
      productId: string;
      productName: string;
      productSlug: string;
      productImage: string | null;
      unitPricePaisa: number;
      quantity: number;
      lineTotalPaisa: number;
    }> = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return apiError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) return apiError(`Insufficient stock for ${product.name}`, 400);
      const lineTotal = product.pricePaisa * item.quantity;
      subtotalPaisa += lineTotal;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: JSON.parse(product.images)[0] || null,
        unitPricePaisa: product.pricePaisa,
        quantity: item.quantity,
        lineTotalPaisa: lineTotal,
      });
    }

    const shippingCostPaisa = subtotalPaisa >= 150000 ? 0 : 6000; // Free above 1500 BDT
    const totalPaisa = subtotalPaisa + shippingCostPaisa;
    const orderNumber = `BP-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        shippingAddress,
        paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
        subtotalPaisa,
        shippingCostPaisa,
        totalPaisa,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
      });
    }

    return apiSuccess({ success: true, data: order }, 201);
  } catch (err) {
    console.error("Order create error:", err);
    return apiError("Failed to create order", 500);
  }
}
