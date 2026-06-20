import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, apiSuccess, apiError } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) return apiError("Forbidden", 403);

    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.name !== undefined) data.name = body.name;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
    if (body.description !== undefined) data.description = body.description;
    if (body.priceBdt !== undefined) data.pricePaisa = Math.round(body.priceBdt);
    if (body.compareAtBdt !== undefined) data.compareAtPricePaisa = body.compareAtBdt ? Math.round(body.compareAtBdt) : null;
    if (body.costBdt !== undefined) data.costPricePaisa = body.costBdt ? Math.round(body.costBdt) : null;
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.stock !== undefined) data.stock = body.stock;
    if (body.status !== undefined) data.status = body.status;
    if (body.visibility !== undefined) data.visibility = body.visibility;
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
    if (body.isBestSeller !== undefined) data.isBestSeller = body.isBestSeller;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.images !== undefined) data.images = JSON.stringify(body.images);
    if (body.keyFeatures !== undefined) data.keyFeatures = JSON.stringify(body.keyFeatures);
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    if (body.attributes !== undefined) data.attributes = JSON.stringify(body.attributes);

    const product = await prisma.product.update({ where: { id }, data });
    return apiSuccess({ success: true, data: product });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return apiError("Slug or SKU already exists", 409);
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return apiError("Product not found", 404);
    }
    console.error("Product update error:", err);
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) return apiError("Forbidden", 403);

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return apiError("Product not found", 404);
    }
    console.error("Product delete error:", err);
    return apiError("Failed to delete product", 500);
  }
}
