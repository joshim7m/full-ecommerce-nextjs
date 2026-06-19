"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package, Filter,
  ChevronLeft, ChevronRight, Star, Sparkles, TrendingUp, X, Save, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import { formatBdt } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_STATUS_BADGES } from "../badges";
import type { Product, ProductStatus, ProductVisibility } from "@/lib/types";

const PAGE_SIZE = 8;

type SortField = "name" | "priceBdt" | "stock" | "salesCount" | "createdAt";
type SortDir = "asc" | "desc";

export function AdminProducts() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // CRUD state
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (categoryFilter !== "ALL") {
      result = result.filter((p) => p.categoryId === categoryFilter);
    }
    // Sort
    const sorted = [...result].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortField === "createdAt") {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      } else if (sortField === "name") {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else {
        av = a[sortField];
        bv = b[sortField];
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [products, search, statusFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleSave(updated: Product) {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
    setEditingProduct(null);
    toast({
      title: "Product saved",
      description: updated.name,
    });
  }

  function handleCreate(newProduct: Product) {
    setProducts((prev) => [newProduct, ...prev]);
    setCreateOpen(false);
    toast({
      title: "Product created",
      description: newProduct.name,
    });
  }

  function handleDelete(product: Product) {
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setDeleteProduct(null);
    toast({
      title: "Product deleted",
      description: product.name,
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-4">
      {/* ====================================================== TOOLBAR */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, SKU, tags..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of stock</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {filtered.length} of {products.length}
            </Badge>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== TABLE */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                      Product {sortField === "name" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("priceBdt")} className="flex items-center gap-1 hover:text-foreground">
                      Price {sortField === "priceBdt" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("stock")} className="flex items-center gap-1 hover:text-foreground">
                      Stock {sortField === "stock" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <button onClick={() => toggleSort("salesCount")} className="flex items-center gap-1 hover:text-foreground">
                      Sales {sortField === "salesCount" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">No products found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((product, idx) => {
                    const statusBadge = PRODUCT_STATUS_BADGES[product.status];
                    const category = CATEGORIES.find((c) => c.id === product.categoryId);
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 shrink-0 rounded-md border object-cover"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
                                {product.isFeatured && <Sparkles className="h-3 w-3 text-amber-500" />}
                                {product.isBestSeller && <TrendingUp className="h-3 w-3 text-rose-500" />}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">{product.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-xs md:table-cell">{category?.name ?? "—"}</TableCell>
                        <TableCell>
                          <div className="font-mono text-sm font-semibold text-primary">{formatBdt(product.priceBdt)}</div>
                          {product.compareAtBdt && (
                            <div className="font-mono text-[10px] text-muted-foreground line-through">{formatBdt(product.compareAtBdt)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`font-mono text-sm font-medium ${product.stock <= product.lowStockThreshold ? "text-rose-600" : "text-foreground"}`}>
                            {product.stock}
                          </span>
                          {product.stock <= product.lowStockThreshold && (
                            <Badge variant="outline" className="ml-1 border-rose-300 bg-rose-50 px-1 py-0 text-[9px] text-rose-700">
                              LOW
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden font-mono text-sm lg:table-cell">{product.salesCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingProduct(product)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteProduct(product)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== MODALS */}
      {/* Create */}
      {createOpen && (
        <ProductFormDialog
          key={`create-${createOpen}`}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSave={handleCreate}
          mode="create"
        />
      )}

      {/* Edit */}
      {editingProduct && (
        <ProductFormDialog
          key={`edit-${editingProduct.id}`}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          product={editingProduct}
          onSave={handleSave}
          mode="edit"
        />
      )}

      {/* View */}
      <Dialog open={!!viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Complete information about this product</DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img src={viewingProduct.images[0]} alt={viewingProduct.name} className="h-32 w-32 rounded-lg border object-cover" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{viewingProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewingProduct.shortDescription}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className={PRODUCT_STATUS_BADGES[viewingProduct.status].className}>
                      {PRODUCT_STATUS_BADGES[viewingProduct.status].label}
                    </Badge>
                    {viewingProduct.isFeatured && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>}
                    {viewingProduct.isBestSeller && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Best Seller</Badge>}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-primary">{formatBdt(viewingProduct.priceBdt)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Spec label="SKU" value={viewingProduct.sku || "—"} />
                <Spec label="Stock" value={String(viewingProduct.stock)} />
                <Spec label="Sales" value={String(viewingProduct.salesCount)} />
                <Spec label="Rating" value={`${viewingProduct.ratingAverage.toFixed(1)} (${viewingProduct.ratingCount})`} />
              </div>
              {viewingProduct.keyFeatures.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Key Features</h4>
                  <ul className="space-y-1">
                    {viewingProduct.keyFeatures.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewingProduct.tags.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {viewingProduct.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteProduct?.name}</span>?
              This action cannot be undone. If the product has order history, it will be soft-deleted instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && handleDelete(deleteProduct)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Product Form Dialog (Create/Edit)
// -----------------------------------------------------------------------------

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Product) => void;
  mode: "create" | "edit";
}

function ProductFormDialog({ open, onOpenChange, product, onSave, mode }: ProductFormDialogProps) {
  const { toast } = useToast();
  const isEdit = mode === "edit" && product;

  // Form state
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Basic validation
    if (!name.trim() || !slug.trim() || !priceBdt) {
      toast({
        title: "Missing required fields",
        description: "Name, slug, and price are required.",
        variant: "destructive",
      });
      return;
    }
    const category = CATEGORIES.find((c) => c.id === categoryId)!;
    const newProduct: Product = {
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
      images: product?.images ?? [`https://placehold.co/800x800/FDE68A/7C2D12?text=${encodeURIComponent(name.slice(0, 15))}`],
      keyFeatures: keyFeaturesInput.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      attributes: product?.attributes ?? {},
      createdAt: product?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newProduct);
  }

  function generateSlug() {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update product details" : "Add a new product to your catalog"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="p-name">Name <span className="text-destructive">*</span></Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Philips Avent Natural Response 260ml Bottle" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-slug">Slug <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product-slug" required className="font-mono" />
                <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                  Generate
                </Button>
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
              <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed product description..." className="min-h-[100px]" />
            </div>
          </div>

          {/* Pricing */}
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

          {/* Organization */}
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

          {/* Tags + features */}
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

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}
