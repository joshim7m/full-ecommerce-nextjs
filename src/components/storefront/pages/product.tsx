"use client";

import { useState } from "react";
import {
  Home, ChevronRight, ShoppingCart, Heart, Share2, Truck, ShieldCheck, RefreshCw,
  Check, Minus, Plus, Star, Sparkles, TrendingUp, Package, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "../product-card";
import { getProductBySlug, getRelatedProducts, getCategoryBySlug } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store/app-store";
import { useCartStore } from "@/lib/store/cart-store";
import { useToast } from "@/hooks/use-toast";
import { formatBdt, calculateDiscountPercent } from "@/lib/format";

interface ProductDetailProps {
  slug: string;
}

export function StorefrontProduct({ slug }: ProductDetailProps) {
  const { goHome, goCategory } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Product not found</h1>
        <Button onClick={goHome} className="mt-4">Back to home</Button>
      </div>
    );
  }

  const category = getCategoryBySlug(product.categorySlug || "") || product.categoryId ? CATEGORIES_LOOKUP[product.categoryId] : null;
  const related = getRelatedProducts(slug);
  const discount = calculateDiscountPercent(product.priceBdt, product.compareAtBdt);
  const outOfStock = product.stock === 0;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(product!, quantity);
    toast({
      title: "Added to cart",
      description: `${product!.name} × ${quantity}`,
    });
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem(product!, quantity);
    // The cart drawer auto-opens on addItem
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={goHome} className="flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" /> Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        {category && (
          <>
            <button onClick={() => goCategory(category.slug)} className="hover:text-primary">
              {category.name}
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="font-medium text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ====================================================== GALLERY */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/30">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.isFeatured && (
                <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                  <Sparkles className="mr-1 h-2.5 w-2.5" /> Featured
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-rose-500 text-white hover:bg-rose-500">
                  <TrendingUp className="mr-1 h-2.5 w-2.5" /> Best Seller
                </Badge>
              )}
              {discount && (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                  -{discount}% OFF
                </Badge>
              )}
            </div>
            {/* Image nav arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i === 0 ? product.images.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i === product.images.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================== INFO */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            {product.categoryName}
          </div>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* Rating + stock */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.ratingAverage)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium text-foreground">{product.ratingAverage.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            {outOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : product.stock <= product.lowStockThreshold ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                Only {product.stock} left — order soon
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                <Check className="mr-1 h-3 w-3" /> In Stock
              </Badge>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="mt-5 flex items-end gap-3">
            <span className="font-mono text-3xl font-bold text-primary">
              {formatBdt(product.priceBdt)}
            </span>
            {product.compareAtBdt && (
              <>
                <span className="font-mono text-lg text-muted-foreground line-through">
                  {formatBdt(product.compareAtBdt)}
                </span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  Save {formatBdt(product.compareAtBdt - product.priceBdt)}
                </Badge>
              </>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            SKU: <span className="font-mono">{product.sku}</span> · Inclusive of all taxes
          </div>

          <Separator className="my-5" />

          {/* Quantity + Add to cart */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-mono text-base font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={handleBuyNow}
              disabled={outOfStock}
            >
              Buy Now
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10"
              onClick={() => {
                setWishlisted(!wishlisted);
                toast({
                  title: wishlisted ? "Removed from wishlist" : "Added to wishlist",
                  description: product.name,
                });
              }}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10"
              onClick={() => {
                toast({ title: "Link copied", description: "Share this product with friends" });
              }}
              aria-label="Share product"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg border bg-muted/20 p-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="h-5 w-5 text-primary" />
              <div className="text-xs font-medium">Fast Delivery</div>
              <div className="text-[10px] text-muted-foreground">1-2 days Dhaka</div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="text-xs font-medium">100% Authentic</div>
              <div className="text-[10px] text-muted-foreground">Genuine products</div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RefreshCw className="h-5 w-5 text-primary" />
              <div className="text-xs font-medium">Easy Returns</div>
              <div className="text-[10px] text-muted-foreground">7-day policy</div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== DETAILS TABS */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </TabsContent>
          <TabsContent value="features" className="mt-4">
            <ul className="space-y-2">
              {product.keyFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="specs" className="mt-4">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["SKU", product.sku],
                    ["Category", product.categoryName],
                    ["Stock", `${product.stock} units`],
                    ["Sales", `${product.salesCount} sold`],
                    ["Rating", `${product.ratingAverage.toFixed(1)} / 5 (${product.ratingCount})`],
                    ["Tags", product.tags.join(", ")],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b last:border-0">
                      <td className="bg-muted/30 w-1/3 px-4 py-2.5 font-medium">{label}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ====================================================== RELATED */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-foreground">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Quick lookup map for category by id
import { CATEGORIES } from "@/lib/mock-data";
const CATEGORIES_LOOKUP: Record<string, typeof CATEGORIES[number]> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);
