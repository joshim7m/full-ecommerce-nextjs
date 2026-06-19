"use client";

import { ShoppingCart, Star, Sparkles, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store/cart-store";
import { useAppStore } from "@/lib/store/app-store";
import { formatBdt, calculateDiscountPercent } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const goProduct = useAppStore((s) => s.goProduct);
  const { toast } = useToast();

  const discount = calculateDiscountPercent(product.priceBdt, product.compareAtBdt);
  const outOfStock = product.stock === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} × 1`,
    });
  }

  function handleCardClick() {
    goProduct(product.slug);
  }

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge className="bg-amber-500 text-white shadow-sm hover:bg-amber-500">
              <Sparkles className="mr-1 h-2.5 w-2.5" /> Featured
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-rose-500 text-white shadow-sm hover:bg-rose-500">
              <TrendingUp className="mr-1 h-2.5 w-2.5" /> Best Seller
            </Badge>
          )}
          {discount && (
            <Badge className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-600">
              -{discount}%
            </Badge>
          )}
        </div>
        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
          </div>
        )}
        {/* Quick add button on hover (desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100 sm:flex"
          aria-label="Quick view"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {product.categoryName}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.shortDescription}
        </p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.ratingAverage.toFixed(1)}</span>
          <span>({product.ratingCount})</span>
        </div>

        {/* Price + Add to cart */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <div className="font-mono text-base font-bold leading-tight text-primary">
              {formatBdt(product.priceBdt)}
            </div>
            {product.compareAtBdt && (
              <div className="font-mono text-xs text-muted-foreground line-through">
                {formatBdt(product.compareAtBdt)}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="shrink-0 gap-1"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
