"use client";

import { Home, ChevronRight, Search as SearchIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "../product-card";
import { searchProducts } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store/app-store";

interface SearchPageProps {
  query: string;
}

export function StorefrontSearch({ query }: SearchPageProps) {
  const { goHome } = useAppStore();
  const results = searchProducts(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={goHome} className="flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" /> Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Search</span>
      </nav>

      {/* Search header */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border bg-accent/30 p-5">
        <SearchIcon className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Search results for &ldquo;{query}&rdquo;
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Found <span className="font-semibold text-foreground">{results.length}</span> matching product{results.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Try different keywords like &ldquo;bottle&rdquo;, &ldquo;frock&rdquo;, &ldquo;breast pump&rdquo;, or browse by category.
          </p>
          <Button onClick={goHome} className="mt-4">Browse Categories</Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Badge variant="secondary">{results.length} results</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
