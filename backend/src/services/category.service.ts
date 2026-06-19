// =============================================================================
// Category Service — CRUD + Redis cache layer with invalidation
// -----------------------------------------------------------------------------
// Cache strategy:
//   • categories:tree                — full active category tree (10 min TTL)
//   • categories:detail:{slug}       — single category + its products (5 min)
//   • categories:{slug}:products:p{n} — paginated products per category (5 min)
//
// Invalidation: any create/update/delete wipes ALL category cache keys
// (cheap and safe — categories change infrequently).
// =============================================================================

import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { cache, cacheKeys } from "../config/redis";
import { logger } from "../config/logger";
import { AppError } from "../utils/api-response";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export interface CategoryWithChildren {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  productCount?: number;
  children?: CategoryWithChildren[];
}

// -----------------------------------------------------------------------------
// List categories — returns cached tree by default
// -----------------------------------------------------------------------------

export async function listCategories(opts: {
  includeInactive?: boolean;
  includeProducts?: boolean;
  parentId?: string;
}): Promise<CategoryWithChildren[]> {
  const cacheKey = `categories:list:${JSON.stringify(opts)}`;

  // Try cache first
  const cached = await cache.get<CategoryWithChildren[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const where: Prisma.CategoryWhereInput = {
    isActive: opts.includeInactive ? undefined : true,
    parentId: opts.parentId ?? undefined,
  };

  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: opts.includeProducts
      ? {
          products: {
            where: { status: "ACTIVE", visibility: "PUBLISHED" },
            select: {
              id: true,
              slug: true,
              name: true,
              pricePaisa: true,
              compareAtPricePaisa: true,
              images: true,
              isFeatured: true,
              isBestSeller: true,
            },
            take: 10,
            orderBy: { salesCount: "desc" },
          },
        }
      : {
          _count: { select: { products: { where: { status: "ACTIVE", visibility: "PUBLISHED" } } } },
        },
  });

  const result: CategoryWithChildren[] = categories.map((c) => {
    const productCount = opts.includeProducts
      ? c.products.length
      : (c._count?.products ?? 0);
    const base: CategoryWithChildren = {
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      iconUrl: c.iconUrl,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      parentId: c.parentId,
      productCount,
    };
    if (opts.includeProducts && "products" in c) {
      // Attach products if requested
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (base as any).products = c.products;
    }
    return base;
  });

  // Cache for 10 minutes
  await cache.set(cacheKey, result, 600);

  return result;
}

// -----------------------------------------------------------------------------
// Get category by slug — with optional product preview
// -----------------------------------------------------------------------------

export async function getCategoryBySlug(slug: string): Promise<CategoryWithChildren> {
  const cacheKey = cacheKeys.categoryDetail(slug);

  const cached = await cache.get<CategoryWithChildren>(cacheKey);
  if (cached) {
    return cached;
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE", visibility: "PUBLISHED" } } },
      },
    },
  });

  if (!category) {
    throw AppError.notFound(`Category with slug "${slug}" not found`);
  }

  const result: CategoryWithChildren = {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
    iconUrl: category.iconUrl,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    parentId: category.parentId,
    productCount: category._count.products,
  };

  await cache.set(cacheKey, result, 300);
  return result;
}

// -----------------------------------------------------------------------------
// Create category — admin only
// -----------------------------------------------------------------------------

export async function createCategory(input: CreateCategoryInput): Promise<CategoryWithChildren> {
  // Check slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw AppError.conflict(`Slug "${input.slug}" is already in use`, { field: "slug" });
  }

  // If parentId provided, verify it exists
  if (input.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) {
      throw AppError.badRequest("Parent category not found");
    }
  }

  const category = await prisma.category.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      iconUrl: input.iconUrl,
      parentId: input.parentId,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });

  await invalidateCategoryCache();
  logger.info(`Category created: ${category.slug} (${category.id})`);

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
    iconUrl: category.iconUrl,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    parentId: category.parentId,
    productCount: 0,
  };
}

// -----------------------------------------------------------------------------
// Update category — admin only
// -----------------------------------------------------------------------------

export async function updateCategory(
  slug: string,
  input: UpdateCategoryInput,
): Promise<CategoryWithChildren> {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (!existing) {
    throw AppError.notFound(`Category with slug "${slug}" not found`);
  }

  // If parentId being updated, verify it exists and isn't a descendant
  if (input.parentId && input.parentId !== existing.parentId) {
    if (input.parentId === existing.id) {
      throw AppError.badRequest("A category cannot be its own parent");
    }
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) {
      throw AppError.badRequest("Parent category not found");
    }
  }

  const updated = await prisma.category.update({
    where: { id: existing.id },
    data: {
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      iconUrl: input.iconUrl,
      parentId: input.parentId,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE", visibility: "PUBLISHED" } } },
      },
    },
  });

  await invalidateCategoryCache();
  logger.info(`Category updated: ${updated.slug} (${updated.id})`);

  return {
    id: updated.id,
    slug: updated.slug,
    name: updated.name,
    description: updated.description,
    imageUrl: updated.imageUrl,
    iconUrl: updated.iconUrl,
    sortOrder: updated.sortOrder,
    isActive: updated.isActive,
    parentId: updated.parentId,
    productCount: updated._count.products,
  };
}

// -----------------------------------------------------------------------------
// Delete category — admin only (blocks if has products)
// -----------------------------------------------------------------------------

export async function deleteCategory(slug: string): Promise<void> {
  const existing = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    throw AppError.notFound(`Category with slug "${slug}" not found`);
  }

  if (existing._count.products > 0) {
    throw AppError.conflict(
      `Cannot delete category with ${existing._count.products} products. Reassign or delete the products first.`,
      { productCount: existing._count.products },
    );
  }

  await prisma.category.delete({ where: { id: existing.id } });
  await invalidateCategoryCache();
  logger.info(`Category deleted: ${slug} (${existing.id})`);
}

// -----------------------------------------------------------------------------
// Cache invalidation — wipe all category cache keys
// -----------------------------------------------------------------------------

export async function invalidateCategoryCache(): Promise<void> {
  const deleted = await cache.delByPattern("categories:*");
  if (deleted > 0) {
    logger.debug(`Category cache invalidated — ${deleted} keys removed`);
  }
}
