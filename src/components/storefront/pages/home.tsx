"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowRight, Sparkles, TrendingUp, Truck, ShieldCheck, Baby, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ProductCard } from "../product-card";
import { CATEGORIES, getFeaturedProducts, getBestSellers, PRODUCTS } from "@/lib/mock-data";

const HERO_SLIDES = [
  {
    badge: "Trusted by 10,000+ Bangladeshi parents",
    title: "Everything your baby needs,",
    titleAccent: "delivered with love.",
    description: "From Philips Avent bottles to hospital-grade breast pumps and adorable party frocks — shop premium baby essentials at honest prices.",
    ctaLabel: "Shop Now",
    ctaSlug: CATEGORIES[0]?.slug ?? "feeding-nursing",
    ctaSecondary: "Browse Clothing",
    ctaSecondarySlug: CATEGORIES[3]?.slug ?? "fashion-clothing",
    imageSrc: () => getFeaturedProducts()[0]?.images[0],
    imageAlt: "Featured product",
  },
  {
    badge: "New arrivals every week",
    title: "Dress your little star",
    titleAccent: "in style & comfort.",
    description: "Adorable party frocks, summer knitted sets, and pure cotton outfits — all designed for your baby's delicate skin.",
    ctaLabel: "Shop Fashion",
    ctaSlug: "fashion-clothing",
    ctaSecondary: "View Featured",
    ctaSecondarySlug: CATEGORIES[0]?.slug ?? "feeding-nursing",
    imageSrc: () => getBestSellers()[3]?.images[0],
    imageAlt: "Baby fashion",
  },
  {
    badge: "Mommy & baby care",
    title: "Everything for",
    titleAccent: "happy feeding times.",
    description: "Hospital-grade breast pumps, anti-colic bottles, washable nursing pads, and more — make every feeding moment a joy.",
    ctaLabel: "Shop Feeding",
    ctaSlug: "feeding-nursing",
    ctaSecondary: "Mom Care",
    ctaSecondarySlug: "mom-care-maternity",
    imageSrc: () => getFeaturedProducts()[2]?.images[0],
    imageAlt: "Feeding essentials",
  },
  {
    badge: "Safe & fun dining",
    title: "Mealtime made",
    titleAccent: "colorful & exciting.",
    description: "Bamboo fiber tableware sets, stainless lunch boxes, and fun straw cups — designed to make every meal an adventure.",
    ctaLabel: "Shop Dining",
    ctaSlug: "feeding-nursing",
    ctaSecondary: "Explore All",
    ctaSecondarySlug: CATEGORIES[0]?.slug ?? "feeding-nursing",
    imageSrc: () => getBestSellers()[4]?.images[0],
    imageAlt: "Kids dining",
  },
];

export function StorefrontHome() {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const featured = getFeaturedProducts();
  const bestSellers = getBestSellers();
  const newArrivals = PRODUCTS.slice().reverse().slice(0, 10);

  const onSelect = useCallback((a: CarouselApi) => {
    setCurrent(a?.selectedScrollSnap() ?? 0);
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    const timer = setInterval(() => api.scrollNext(), 5000);
    return () => {
      clearInterval(timer);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api) return;
    const t = setTimeout(() => setCurrent(api.selectedScrollSnap() ?? 0), 0);
    return () => clearTimeout(t);
  }, [api]);

  return (
    <div className="flex flex-col">
      {/* HERO CAROUSEL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.94 0.04 75) 0, transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.94 0.04 25) 0, transparent 40%)" }} />
        <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="relative">
          <CarouselContent>
            {HERO_SLIDES.map((slide, i) => (
              <CarouselItem key={i}>
                <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
                  <div>
                    <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
                      <Sparkles className="mr-1 h-3 w-3" /> {slide.badge}
                    </Badge>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                      {slide.title}
                      <span className="block text-primary">{slide.titleAccent}</span>
                    </h1>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {slide.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button size="lg" className="gap-2" onClick={() => router.push(`/category/${slide.ctaSlug}`)}>
                        {slide.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => router.push(`/category/${slide.ctaSecondarySlug}`)}>
                        {slide.ctaSecondary}
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
                  <div className="relative hidden lg:flex items-center justify-center">
                    <img
                      src={slide.imageSrc()}
                      alt={slide.imageAlt}
                      className="aspect-square w-full max-w-sm rounded-2xl border object-cover shadow-lg"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </Carousel>
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
