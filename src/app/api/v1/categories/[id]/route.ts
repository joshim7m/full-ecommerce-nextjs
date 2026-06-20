import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, apiSuccess, apiError } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) return apiError("Forbidden", 403);

    const { id } = await params;
    const body = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.parentId !== undefined && { parentId: body.parentId }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return apiSuccess({ success: true, data: category });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return apiError("Slug already exists", 409);
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return apiError("Category not found", 404);
    }
    console.error("Category update error:", err);
    return apiError("Failed to update category", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) return apiError("Forbidden", 403);

    const { id } = await params;

    // Check for products
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return apiError(`Cannot delete category with ${productCount} product(s)`, 400);
    }

    await prisma.category.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return apiError("Category not found", 404);
    }
    console.error("Category delete error:", err);
    return apiError("Failed to delete category", 500);
  }
}
