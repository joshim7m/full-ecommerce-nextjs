// =============================================================================
// Product Service — CRUD + listing + Redis cache with invalidation
// -----------------------------------------------------------------------------
// Cache strategy:
//   • products:list:{base64(params)}     — paginated lists (5 min TTL)
//   • products:detail:{slug}             — single product (2 min)
//   • products:featured                  — featured products list (5 min)
//   • products:bestsellers               — best-seller list (5 min)
//   • products:related:{slug}            — related products (5 min)
//
// Invalidation: any create/update/delete wipes ALL product cache keys plus
// the category cache (since category product counts change).
// =============================================================================

import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { cache, cacheKeys } from "../config/redis";
import { logger } from "../config/logger";
import { AppError } from "../utils/api-response";
import { bdtToPaisa, multiplyPaisa, paisaToBdt } from "../utils/paisa";
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
} from "../validators/product.validator";

// -----------------------------------------------------------------------------
// Public types — API-friendly shapes (prices in BDT, not paisa)
// -----------------------------------------------------------------------------

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  priceBdt: number;
  compareAtBdt: number | null;
  currency: string;
  primaryImage: string | null;
  images: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  ratingAverage: number;
  ratingCount: number;
  stock: number;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  sku: string | null;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  costBdt: number | null;
  barcode: string | null;
  lowStockThreshold: number;
  weightGrams: number | null;
  status: string;
  visibility: string;
  salesCount: number;
  keyFeatures: string[];
  tags: string[];
  attributes: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResult {
  items: ProductSummary[];
  total: number;
}

// -----------------------------------------------------------------------------
// LIST — paginated, filtered, sorted product listing
// -----------------------------------------------------------------------------

export async function listProducts(query: ListProductsQuery): Promise<ProductListResult> {
  const cacheKey = cacheKeys.productList(query);

  const cached = await cache.get<ProductListResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Build where clause
  const where: Prisma.ProductWhereInput = {};

  // Status filter — public listings only show ACTIVE+PUBLISHED unless includeInactive
  if (query.includeInactive) {
    if (query.status) where.status = query.status;
    if (query.visibility) where.visibility = query.visibility;
  } else {
    where.status = "ACTIVE";
    where.visibility = "PUBLISHED";
  }

  // Category filter
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  } else if (query.categorySlug) {
    where.category = { slug: query.categorySlug };
  }

  // Featured / Best-seller flags
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
  if (query.isBestSeller !== undefined) where.isBestSeller = query.isBestSeller;

  // Price range filter (convert BDT → paisa)
  if (query.minPriceBdt !== undefined || query.maxPriceBdt !== undefined) {
    where.pricePaisa = {};
    if (query.minPriceBdt !== undefined) where.pricePaisa.gte = bdtToPaisa(query.minPriceBdt);
    if (query.maxPriceBdt !== undefined) where.pricePaisa.lte = bdtToPaisa(query.maxPriceBdt);
  }

  // Search — case-insensitive contains on name + description + tags
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { shortDescription: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { tags: { array_contains: query.search } },
    ];
  }

  // Tags filter
  if (query.tags && query.tags.length > 0) {
    where.tags = { hasSome: query.tags };
  }

  // Build order by
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
  switch (query.sort) {
    case "price_asc":
      orderBy.push({ pricePaisa: "asc" });
      break;
    case "price_desc":
      orderBy.push({ pricePaisa: "desc" });
      break;
    case "name_asc":
      orderBy.push({ name: "asc" });
      break;
    case "name_desc":
      orderBy.push({ name: "desc" });
      break;
    case "best_selling":
      orderBy.push({ salesCount: "desc" });
      break;
    case "top_rated":
      orderBy.push({ ratingAverage: "desc" });
      break;
    case "newest":
    default:
      orderBy.push({ createdAt: "desc" });
      break;
  }

  // Execute query
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        category: {
          select: { id: true, slug: true, name: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const items: ProductSummary[] = products.map(toSummary);

  const result: ProductListResult = { items, total };

  // Cache for 5 minutes
  await cache.set(cacheKey, result, 300);

  return result;
}

// -----------------------------------------------------------------------------
// DETAIL — single product by slug
// -----------------------------------------------------------------------------

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const cacheKey = cacheKeys.productDetail(slug);

  const cached = await cache.get<ProductDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, slug: true, name: true },
      },
    },
  });

  if (!product) {
    throw AppError.notFound(`Product with slug "${slug}" not found`);
  }

  const detail: ProductDetail = toDetail(product);

  // Cache for 2 minutes
  await cache.set(cacheKey, detail, 120);

  return detail;
}

// -----------------------------------------------------------------------------
// FEATURED — list of featured products
// -----------------------------------------------------------------------------

export async function getFeaturedProducts(limit = 10): Promise<ProductSummary[]> {
  const cacheKey = cacheKeys.featuredProducts();

  const cached = await cache.get<ProductSummary[]>(cacheKey);
  if (cached) {
    return cached.slice(0, limit);
  }

  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      status: "ACTIVE",
      visibility: "PUBLISHED",
    },
    orderBy: [{ salesCount: "desc" }, { ratingAverage: "desc" }],
    take: Math.min(limit * 2, 20), // fetch more, cache more, return requested slice
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });

  const summaries = products.map(toSummary);
  await cache.set(cacheKey, summaries, 300);
  return summaries.slice(0, limit);
}

// -----------------------------------------------------------------------------
// BEST SELLERS — list of best-selling products
// -----------------------------------------------------------------------------

export async function getBestSellers(limit = 10): Promise<ProductSummary[]> {
  const cacheKey = cacheKeys.bestSellers();

  const cached = await cache.get<ProductSummary[]>(cacheKey);
  if (cached) {
    return cached.slice(0, limit);
  }

  const products = await prisma.product.findMany({
    where: {
      isBestSeller: true,
      status: "ACTIVE",
      visibility: "PUBLISHED",
    },
    orderBy: [{ salesCount: "desc" }, { ratingAverage: "desc" }],
    take: Math.min(limit * 2, 20),
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });

  const summaries = products.map(toSummary);
  await cache.set(cacheKey, summaries, 300);
  return summaries.slice(0, limit);
}

// -----------------------------------------------------------------------------
// RELATED — related products in the same category
// -----------------------------------------------------------------------------

export async function getRelatedProducts(slug: string, limit = 6): Promise<ProductSummary[]> {
  const cacheKey = cacheKeys.relatedProducts(slug);

  const cached = await cache.get<ProductSummary[]>(cacheKey);
  if (cached) {
    return cached.slice(0, limit);
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { categoryId: true },
  });

  if (!product) {
    throw AppError.notFound(`Product with slug "${slug}" not found`);
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      slug: { not: slug },
      status: "ACTIVE",
      visibility: "PUBLISHED",
    },
    orderBy: [{ salesCount: "desc" }],
    take: Math.min(limit * 2, 12),
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });

  const summaries = related.map(toSummary);
  await cache.set(cacheKey, summaries, 300);
  return summaries.slice(0, limit);
}

// -----------------------------------------------------------------------------
// CREATE — admin only
// -----------------------------------------------------------------------------

export async function createProduct(input: CreateProductInput): Promise<ProductDetail> {
  // Check slug uniqueness
  const slugTaken = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (slugTaken) {
    throw AppError.conflict(`Slug "${input.slug}" is already in use`, { field: "slug" });
  }

  // Check SKU uniqueness if provided
  if (input.sku) {
    const skuTaken = await prisma.product.findUnique({ where: { sku: input.sku } });
    if (skuTaken) {
      throw AppError.conflict(`SKU "${input.sku}" is already in use`, { field: "sku" });
    }
  }

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw AppError.badRequest("Category not found", { field: "categoryId" });
  }

  const product = await prisma.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      shortDescription: input.shortDescription,
      description: input.description,
      pricePaisa: bdtToPaisa(input.priceBdt),
      compareAtPricePaisa: input.compareAtBdt ? bdtToPaisa(input.compareAtBdt) : null,
      costPricePaisa: input.costBdt ? bdtToPaisa(input.costBdt) : null,
      currency: "BDT",
      sku: input.sku,
      barcode: input.barcode,
      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      weightGrams: input.weightGrams,
      status: input.status ?? "ACTIVE",
      visibility: input.visibility ?? "PUBLISHED",
      isFeatured: input.isFeatured ?? false,
      isBestSeller: input.isBestSeller ?? false,
      categoryId: input.categoryId,
      images: input.images as Prisma.InputJsonValue,
      keyFeatures: input.keyFeatures as Prisma.InputJsonValue,
      tags: input.tags as Prisma.InputJsonValue,
      attributes: (input.attributes ?? {}) as Prisma.InputJsonValue,
    },
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });

  await invalidateProductCache();
  logger.info(`Product created: ${product.slug} (${product.id})`);

  return toDetail(product);
}

// -----------------------------------------------------------------------------
// UPDATE — admin only
// -----------------------------------------------------------------------------

export async function updateProduct(id: string, input: UpdateProductInput): Promise<ProductDetail> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound(`Product with id "${id}" not found`);
  }

  // Check SKU uniqueness if being changed
  if (input.sku && input.sku !== existing.sku) {
    const skuTaken = await prisma.product.findUnique({ where: { sku: input.sku } });
    if (skuTaken) {
      throw AppError.conflict(`SKU "${input.sku}" is already in use`, { field: "sku" });
    }
  }

  // Verify category if being changed
  if (input.categoryId && input.categoryId !== existing.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw AppError.badRequest("Category not found", { field: "categoryId" });
    }
  }

  // Build update data — only include provided fields
  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription;
  if (input.description !== undefined) data.description = input.description;
  if (input.priceBdt !== undefined) data.pricePaisa = bdtToPaisa(input.priceBdt);
  if (input.compareAtBdt !== undefined) {
    data.compareAtPricePaisa = input.compareAtBdt ? bdtToPaisa(input.compareAtBdt) : null;
  }
  if (input.costBdt !== undefined) {
    data.costPricePaisa = input.costBdt ? bdtToPaisa(input.costBdt) : null;
  }
  if (input.sku !== undefined) data.sku = input.sku;
  if (input.barcode !== undefined) data.barcode = input.barcode;
  if (input.stock !== undefined) data.stock = input.stock;
  if (input.lowStockThreshold !== undefined) data.lowStockThreshold = input.lowStockThreshold;
  if (input.weightGrams !== undefined) data.weightGrams = input.weightGrams;
  if (input.status !== undefined) data.status = input.status;
  if (input.visibility !== undefined) data.visibility = input.visibility;
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
  if (input.isBestSeller !== undefined) data.isBestSeller = input.isBestSeller;
  if (input.categoryId !== undefined) {
    data.category = { connect: { id: input.categoryId } };
  }
  if (input.images !== undefined) data.images = input.images as Prisma.InputJsonValue;
  if (input.keyFeatures !== undefined) data.keyFeatures = input.keyFeatures as Prisma.InputJsonValue;
  if (input.tags !== undefined) data.tags = input.tags as Prisma.InputJsonValue;
  if (input.attributes !== undefined) data.attributes = input.attributes as Prisma.InputJsonValue;

  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });

  await invalidateProductCache();
  logger.info(`Product updated: ${product.slug} (${product.id})`);

  return toDetail(product);
}

// -----------------------------------------------------------------------------
// DELETE — admin only
// -----------------------------------------------------------------------------

export async function deleteProduct(id: string): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound(`Product with id "${id}" not found`);
  }

  // Check if product is referenced in any orders
  const orderItemCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderItemCount > 0) {
    // Soft-delete by marking as DISCONTINUED instead of hard delete
    await prisma.product.update({
      where: { id },
      data: {
        status: "DISCONTINUED",
        visibility: "HIDDEN",
      },
    });
    logger.info(`Product soft-deleted (has order history): ${existing.slug} (${id})`);
  } else {
    await prisma.product.delete({ where: { id } });
    logger.info(`Product deleted: ${existing.slug} (${id})`);
  }

  await invalidateProductCache();
}

// -----------------------------------------------------------------------------
// Cache invalidation — wipe ALL product + category cache keys
// -----------------------------------------------------------------------------

export async function invalidateProductCache(): Promise<void> {
  const [pDeleted, cDeleted] = await Promise.all([
    cache.delByPattern("products:*"),
    cache.delByPattern("categories:*"),
  ]);
  const totalDeleted = pDeleted + cDeleted;
  if (totalDeleted > 0) {
    logger.debug(`Product cache invalidated — ${pDeleted} product keys, ${cDeleted} category keys removed`);
  }
}

// -----------------------------------------------------------------------------
// Mappers — Prisma entity → API DTO
// -----------------------------------------------------------------------------

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: { select: { id: true; slug: true; name: true } } };
}>;

function toSummary(p: ProductWithCategory): ProductSummary {
  const images = Array.isArray(p.images) ? (p.images as string[]) : [];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    priceBdt: paisaToBdt(p.pricePaisa),
    compareAtBdt: p.compareAtPricePaisa ? paisaToBdt(p.compareAtPricePaisa) : null,
    currency: p.currency,
    primaryImage: images[0] ?? null,
    images,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    stock: p.stock,
    categoryId: p.categoryId,
    categorySlug: p.category?.slug,
    categoryName: p.category?.name,
    sku: p.sku,
  };
}

function toDetail(p: ProductWithCategory): ProductDetail {
  const summary = toSummary(p);
  return {
    ...summary,
    description: p.description,
    costBdt: p.costPricePaisa ? paisaToBdt(p.costPricePaisa) : null,
    barcode: p.barcode,
    lowStockThreshold: p.lowStockThreshold,
    weightGrams: p.weightGrams,
    status: p.status,
    visibility: p.visibility,
    salesCount: p.salesCount,
    keyFeatures: Array.isArray(p.keyFeatures) ? (p.keyFeatures as string[]) : [],
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    attributes: (p.attributes as Record<string, unknown>) ?? {},
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Re-export for tests / other services
export { multiplyPaisa };
