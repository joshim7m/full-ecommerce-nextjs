import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });

    const result = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      productCount: c._count.products,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return apiSuccess({ success: true, data: result });
  } catch (err) {
    console.error("Categories list error:", err);
    return apiError("Failed to fetch categories", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return apiError("Forbidden", 403);
    }

    const body = await req.json();
    const { slug, name, description, imageUrl, parentId, sortOrder, isActive } = body;

    if (!slug || !name) return apiError("Slug and name are required", 400);

    const category = await prisma.category.create({
      data: {
        slug,
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return apiSuccess({ success: true, data: category }, 201);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return apiError("Slug already exists", 409);
    }
    console.error("Category create error:", err);
    return apiError("Failed to create category", 500);
  }
}
