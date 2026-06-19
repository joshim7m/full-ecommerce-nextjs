"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, TrendingUp, Truck, ShieldCheck, Baby, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "../product-card";
import { CATEGORIES, getFeaturedProducts, getBestSellers, PRODUCTS } from "@/lib/mock-data";

export function StorefrontHome() {
  const router = useRouter();
  const featured = getFeaturedProducts();
  const bestSellers = getBestSellers();
  const newArrivals = PRODUCTS.slice().reverse().slice(0, 10);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.94 0.04 75) 0, transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.94 0.04 25) 0, transparent 40%)" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="mr-1 h-3 w-3" /> Trusted by 10,000+ Bangladeshi parents
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Everything your baby needs,
              <span className="block text-primary">delivered with love.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              From Philips Avent bottles to hospital-grade breast pumps and adorable party frocks —
              shop premium baby essentials at honest prices.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" onClick={() => router.push(`/category/${CATEGORIES[0].slug}`)}>
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push(`/category/${CATEGORIES[3].slug}`)}>
                Browse Clothing
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                Free Dhaka delivery ৳1,500+
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                100% authentic products
              </div>
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src={featured[0]?.images[0]}
                  alt={featured[0]?.name}
                  className="aspect-square w-full rounded-2xl border object-cover shadow-lg"
                />
                <img
                  src={bestSellers[0]?.images[0]}
                  alt={bestSellers[0]?.name}
                  className="aspect-square w-full rounded-2xl border object-cover shadow-lg"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src={featured[1]?.images[0]}
                  alt={featured[1]?.name}
                  className="aspect-square w-full rounded-2xl border object-cover shadow-lg"
                />
                <img
                  src={bestSellers[1]?.images[0]}
                  alt={bestSellers[1]?.name}
                  className="aspect-square w-full rounded-2xl border object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Find exactly what your little one needs.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            return (
              <button
                key={cat.id}
                onClick={() => router.push(`/category/${cat.slug}`)}
                className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent transition-transform group-hover:scale-110">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold leading-tight text-foreground">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat.productCount} products</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Handpicked
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Featured Products</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {featured.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-accent/30 to-primary/5">
          <CardContent className="grid items-center gap-6 p-6 sm:grid-cols-2 sm:p-10">
            <div>
              <Badge className="mb-3 bg-primary text-primary-foreground hover:bg-primary">
                <TrendingUp className="mr-1 h-3 w-3" /> Limited time
              </Badge>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                Save up to 20% on Mom Care essentials
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hospital-grade breast pumps, washable nursing pads, and multifunctional mommy bags — at their best prices.
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={() => router.push("/category/mom-care-maternity")}
              >
                Shop Mom Care
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 sm:h-40 sm:w-40">
                <Baby className="h-16 w-16 text-primary sm:h-20 sm:w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              Customer favorites
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Best Sellers</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {bestSellers.slice(0, 5).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Fresh in store
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">New Arrivals</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {newArrivals.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Explore More Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">Dive deeper into each product category.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const products = PRODUCTS.filter((p) => p.categoryId === cat.id).slice(0, 3);
            return (
              <Card key={cat.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-foreground">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => router.push(`/category/${cat.slug}`)}
                    >
                      View all
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/product/${p.slug}`)}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-12 w-12 shrink-0 rounded-md border object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                          <div className="font-mono text-xs font-semibold text-primary">
                            ৳{p.priceBdt.toLocaleString("en-BD")}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
