"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Home, ChevronRight, Package, ArrowUpDown, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "../product-card";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/mock-data";

interface CategoryPageProps {
  slug: string;
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc" | "best_selling";

export function StorefrontCategory({ slug }: CategoryPageProps) {
  const router = useRouter();
  const [sort, setSort] = useState<SortOption>("newest");

  const category = getCategoryBySlug(slug);
  const products = useMemo(() => {
    if (!category) return [];
    const items = getProductsByCategory(category.id);
    const sorted = [...items];
    switch (sort) {
      case "price_asc":
        return sorted.sort((a, b) => a.priceBdt - b.priceBdt);
      case "price_desc":
        return sorted.sort((a, b) => b.priceBdt - a.priceBdt);
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "best_selling":
        return sorted.sort((a, b) => b.salesCount - a.salesCount);
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [category, sort]);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Category not found</h1>
        <Button onClick={() => router.push("/")} className="mt-4">Back to home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={() => router.push("/")} className="flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" /> Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-xl border bg-gradient-to-r from-accent/40 to-accent/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm">
            <Tag className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{category.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
            <Badge variant="secondary" className="mt-2">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* Sort bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{products.length}</span> products
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A to Z</SelectItem>
              <SelectItem value="best_selling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon — new stock arriving weekly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
