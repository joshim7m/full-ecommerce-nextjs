"use client";

import { ArrowLeft, Edit, Package, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRODUCTS } from "@/lib/mock-data";
import { formatBdt } from "@/lib/format";
import { PRODUCT_STATUS_BADGES } from "../badges";

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Product not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/products")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/products/${product.slug}/edit`)} className="gap-2">
          <Edit className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="flex gap-4">
        <img src={product.images[0]} alt={product.name} className="h-40 w-40 rounded-lg border object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={PRODUCT_STATUS_BADGES[product.status].className}>
              {PRODUCT_STATUS_BADGES[product.status].label}
            </Badge>
            {product.isFeatured && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>}
            {product.isBestSeller && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Best Seller</Badge>}
          </div>
          <div className="mt-4 font-mono text-3xl font-bold text-primary">{formatBdt(product.priceBdt)}</div>
          {product.compareAtBdt && (
            <div className="font-mono text-sm text-muted-foreground line-through">{formatBdt(product.compareAtBdt)}</div>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Spec label="SKU" value={product.sku || "—"} />
            <Spec label="Stock" value={String(product.stock)} />
            <Spec label="Sales" value={String(product.salesCount)} />
            <Spec label="Rating" value={`${product.ratingAverage.toFixed(1)} (${product.ratingCount})`} />
          </div>
        </CardContent>
      </Card>

      {product.description && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          </CardContent>
        </Card>
      )}

      {product.keyFeatures.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold">Key Features</h3>
            <ul className="space-y-1">
              {product.keyFeatures.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {product.tags.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {product.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
