"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductStatus, ProductVisibility } from "@/lib/types";

function placeholderSvg(text: string): string {
  const label = text.slice(0, 15).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#FDE68A"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7C2D12" font-family="sans-serif" font-size="40">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface ProductFormProps {
  product?: Product | null;
  mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = mode === "edit" && product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [priceBdt, setPriceBdt] = useState(String(product?.priceBdt ?? ""));
  const [compareAtBdt, setCompareAtBdt] = useState(String(product?.compareAtBdt ?? ""));
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? CATEGORIES[0].id);
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "ACTIVE");
  const [visibility, setVisibility] = useState<ProductVisibility>(product?.visibility ?? "PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(", "));
  const [keyFeaturesInput, setKeyFeaturesInput] = useState((product?.keyFeatures ?? []).join("\n"));

  function generateSlug() {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !priceBdt) {
      toast({ title: "Missing required fields", description: "Name, slug, and price are required.", variant: "destructive" });
      return;
    }
    const category = CATEGORIES.find((c) => c.id === categoryId)!;
    const updatedProduct: Product = {
      id: product?.id ?? `prod_${Date.now()}`,
      slug,
      name,
      shortDescription: shortDescription || null,
      description: description || null,
      priceBdt: Number(priceBdt),
      compareAtBdt: compareAtBdt ? Number(compareAtBdt) : null,
      costBdt: product?.costBdt ?? null,
      currency: "BDT",
      sku: sku || null,
      barcode: product?.barcode ?? null,
      stock: Number(stock) || 0,
      lowStockThreshold: product?.lowStockThreshold ?? 5,
      weightGrams: product?.weightGrams ?? null,
      status,
      visibility,
      isFeatured,
      isBestSeller,
      ratingAverage: product?.ratingAverage ?? 0,
      ratingCount: product?.ratingCount ?? 0,
      salesCount: product?.salesCount ?? 0,
      categoryId,
      categorySlug: category.slug,
      categoryName: category.name,
      images: product?.images ?? [placeholderSvg(name)],
      keyFeatures: keyFeaturesInput.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      attributes: product?.attributes ?? {},
      createdAt: product?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = PRODUCTS.some((p) => p.id === updatedProduct.id);
    if (existing) {
      Object.assign(PRODUCTS.find((p) => p.id === updatedProduct.id)!, updatedProduct);
    } else {
      PRODUCTS.push(updatedProduct);
    }

    toast({ title: isEdit ? "Product updated" : "Product created", description: updatedProduct.name });
    router.push("/admin/products");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isEdit ? "Edit Product" : "Create New Product"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update product details" : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Product name, description and identification</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="p-name">Name <span className="text-destructive">*</span></Label>
                <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Philips Avent Natural Response 260ml Bottle" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-slug">Slug <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product-slug" required className="font-mono" />
                  <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Generate</Button>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-sku">SKU</Label>
                <Input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. PA-NR-260" className="font-mono" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="p-short">Short Description</Label>
                <Input id="p-short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="One-line summary shown on product cards" maxLength={300} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="p-desc">Full Description</Label>
                <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed product description..." className="min-h-[120px]" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="p-price">Price (৳) <span className="text-destructive">*</span></Label>
                <Input id="p-price" type="number" min="0" step="0.01" value={priceBdt} onChange={(e) => setPriceBdt(e.target.value)} placeholder="950" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-compare">Compare-at (৳)</Label>
                <Input id="p-compare" type="number" min="0" step="0.01" value={compareAtBdt} onChange={(e) => setCompareAtBdt(e.target.value)} placeholder="1100" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-stock">Stock</Label>
                <Input id="p-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="100" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                    <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as ProductVisibility)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Best Seller
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="p-tags">Tags (comma-separated)</Label>
                <Input id="p-tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="bottle, anti-colic, philips" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-features">Key Features (one per line)</Label>
                <Textarea id="p-features" value={keyFeaturesInput} onChange={(e) => setKeyFeaturesInput(e.target.value)} placeholder={"Natural Response nipple\nAnti-colic AirFree vent\nBPA-free"} className="min-h-[80px]" />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
