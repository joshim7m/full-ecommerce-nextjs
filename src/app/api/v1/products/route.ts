import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const isFeatured = searchParams.get("isFeatured");
    const isBestSeller = searchParams.get("isBestSeller");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {};
    if (!includeInactive) where.status = "ACTIVE";
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }
    if (isFeatured === "true") where.isFeatured = true;
    if (isBestSeller === "true") where.isBestSeller = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { id: true, slug: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const result = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      priceBdt: p.pricePaisa,
      compareAtBdt: p.compareAtPricePaisa,
      costBdt: p.costPricePaisa,
      currency: p.currency,
      sku: p.sku,
      barcode: p.barcode,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      weightGrams: p.weightGrams,
      status: p.status,
      visibility: p.visibility,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
      salesCount: p.salesCount,
      categoryId: p.categoryId,
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      images: JSON.parse(p.images),
      keyFeatures: JSON.parse(p.keyFeatures),
      tags: JSON.parse(p.tags),
      attributes: JSON.parse(p.attributes),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return apiSuccess({ success: true, data: result, total, page, limit });
  } catch (err) {
    console.error("Products list error:", err);
    return apiError("Failed to fetch products", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) return apiError("Forbidden", 403);

    const body = await req.json();
    const { slug, name, shortDescription, description, priceBdt, compareAtBdt, costBdt, sku, stock, status, visibility, isFeatured, isBestSeller, categoryId, images, keyFeatures, tags, attributes } = body;

    if (!slug || !name || priceBdt === undefined || !categoryId) {
      return apiError("Slug, name, priceBdt, and categoryId are required", 400);
    }

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        shortDescription: shortDescription || null,
        description: description || null,
        pricePaisa: Math.round(priceBdt),
        compareAtPricePaisa: compareAtBdt ? Math.round(compareAtBdt) : null,
        costPricePaisa: costBdt ? Math.round(costBdt) : null,
        sku: sku || null,
        stock: stock ?? 0,
        status: status || "ACTIVE",
        visibility: visibility || "PUBLISHED",
        isFeatured: isFeatured ?? false,
        isBestSeller: isBestSeller ?? false,
        categoryId,
        images: JSON.stringify(images || []),
        keyFeatures: JSON.stringify(keyFeatures || []),
        tags: JSON.stringify(tags || []),
        attributes: JSON.stringify(attributes || {}),
      },
    });

    return apiSuccess({ success: true, data: product }, 201);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return apiError("Slug or SKU already exists", 409);
    }
    console.error("Product create error:", err);
    return apiError("Failed to create product", 500);
  }
}
