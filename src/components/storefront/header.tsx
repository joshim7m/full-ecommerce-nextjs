"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Menu, X, Baby, Heart, User, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart-store";
import { useAppStore } from "@/lib/store/app-store";
import { CATEGORIES } from "@/lib/mock-data";
import { searchProducts } from "@/lib/mock-data";
import { formatBdt } from "@/lib/format";

export function StorefrontHeader() {
  const { items, openCart } = useCartStore();
  const { goHome, goCategory, goProduct, goSearch, setMobileMenuOpen, mobileMenuOpen, setMode, mode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([]);
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // Sticky shadow on scroll
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Debounced search (300ms)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      // Use a microtask to avoid synchronous setState in effect body
      const t = setTimeout(() => {
        setSearchResults([]);
        setShowResults(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(() => {
      const results = searchProducts(trimmed).slice(0, 6);
      setSearchResults(results);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      goSearch(searchQuery.trim());
      setShowResults(false);
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur transition-shadow ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs sm:text-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>Free delivery inside Dhaka on orders over ৳1,500 · Cash on Delivery available</span>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px]">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="flex items-center gap-2 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Baby className="h-5 w-5" />
                </div>
                <span>Baby Planet BD</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1">
              <button
                onClick={() => goHome()}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
              >
                Home
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shop by Category
              </div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => goCategory(cat.slug)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{cat.iconUrl?.match(/text=([^&]+)/)?.[1] ?? "📦"}</span>
                    {cat.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
              <div className="mt-3 border-t pt-3">
                <button
                  onClick={() => setMode("admin")}
                  className="flex w-full items-center justify-between rounded-lg bg-accent px-3 py-2.5 text-left text-sm font-medium hover:bg-accent/80"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Admin Dashboard
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <button
          onClick={() => goHome()}
          className="flex shrink-0 items-center gap-2"
          aria-label="Go to homepage"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-10 sm:w-10">
            <Baby className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold leading-tight text-foreground">Baby Planet</div>
            <div className="-mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Bangladesh</div>
          </div>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          <button
            onClick={() => goHome()}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
          >
            Home
          </button>
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => goCategory(cat.slug)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              {cat.name.split(" ")[0]}
            </button>
          ))}
        </nav>

        {/* Search bar */}
        <div ref={searchRef} className="relative flex-1 lg:max-w-md">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for bottles, frocks, breast pumps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="h-10 rounded-full border-border bg-muted/40 pl-9 pr-4 text-sm"
                aria-label="Search products"
              />
            </div>
          </form>

          {/* Search dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border bg-popover shadow-lg">
              <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </div>
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    goProduct(p.slug);
                    setShowResults(false);
                    setSearchQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-12 w-12 shrink-0 rounded-md border object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.categoryName}</div>
                  </div>
                  <div className="shrink-0 text-sm font-bold text-primary">{formatBdt(p.priceBdt)}</div>
                </button>
              ))}
              <button
                onClick={() => {
                  goSearch(searchQuery);
                  setShowResults(false);
                }}
                className="flex w-full items-center justify-center gap-1 border-t bg-muted/30 px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted/50"
              >
                See all results
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Account"
            onClick={() => setMode("admin")}
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Cart with ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
            onClick={openCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label="Toggle admin mode"
            onClick={() => setMode(mode === "storefront" ? "admin" : "storefront")}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
