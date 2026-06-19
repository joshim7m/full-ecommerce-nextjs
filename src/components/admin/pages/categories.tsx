"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Tag, Save, X, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/format";
import type { Category } from "@/lib/types";

export function AdminCategories() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiClient("/categories?includeInactive=true");
      setCategories(res.data ?? []);
    } catch (err: any) {
      toast({ title: "Failed to load categories", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [categories, search]);

  async function handleCreate(newCat: Category) {
    try {
      const res: any = await apiClient("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
          sortOrder: newCat.sortOrder,
          isActive: newCat.isActive,
        }),
      });
      setCategories((prev) => [...prev, res.data]);
      setCreateOpen(false);
      toast({ title: "Category created", description: res.data.name });
    } catch (err: any) {
      toast({ title: "Failed to create category", description: err.message, variant: "destructive" });
    }
  }

  async function handleUpdate(updated: Category) {
    try {
      const res: any = await apiClient(`/categories/${updated.slug}`, {
        method: "PUT",
        body: JSON.stringify({
          name: updated.name,
          description: updated.description,
          sortOrder: updated.sortOrder,
          isActive: updated.isActive,
        }),
      });
      setCategories((prev) => prev.map((c) => (c.id === res.data.id ? res.data : c)));
      setEditingCategory(null);
      toast({ title: "Category saved", description: res.data.name });
    } catch (err: any) {
      toast({ title: "Failed to update category", description: err.message, variant: "destructive" });
    }
  }

  async function handleDelete(cat: Category) {
    try {
      await apiClient(`/categories/${cat.slug}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setDeletingCategory(null);
      toast({ title: "Category deleted", description: cat.name, variant: "destructive" });
    } catch (err: any) {
      toast({ title: "Failed to delete category", description: err.message, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filtered.length} categories</Badge>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="hidden md:table-cell">Sort Order</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <Tag className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">No categories found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cat, idx) => {
                    const count = cat.productCount ?? 0;
                    return (
                      <TableRow key={cat.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                              <Tag className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{cat.name}</div>
                              <div className="line-clamp-1 text-xs text-muted-foreground">{cat.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs md:table-cell">{cat.slug}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{count}</Badge>
                        </TableCell>
                        <TableCell className="hidden font-mono text-sm md:table-cell">{cat.sortOrder}</TableCell>
                        <TableCell>
                          <Switch checked={cat.isActive} disabled />
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{formatDate(cat.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingCategory(cat)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingCategory(cat)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeletingCategory(cat)}
                                disabled={count > 0}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete {count > 0 && "(has products)"}
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
        </CardContent>
      </Card>

      {/* Create */}
      {createOpen && (
        <CategoryFormDialog
          key={`create-${createOpen}`}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSave={handleCreate}
          mode="create"
        />
      )}

      {/* Edit */}
      {editingCategory && (
        <CategoryFormDialog
          key={`edit-${editingCategory.id}`}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onSave={handleUpdate}
          mode="edit"
        />
      )}

      {/* View */}
      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {viewingCategory && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewingCategory.name}</h3>
                  <code className="font-mono text-xs text-muted-foreground">{viewingCategory.slug}</code>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{viewingCategory.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/20 p-2.5">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">Products</div>
                  <div className="font-mono text-lg font-bold">{viewingCategory.productCount ?? 0}</div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-2.5">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">Sort order</div>
                  <div className="font-mono text-lg font-bold">{viewingCategory.sortOrder}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deletingCategory?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCategory && handleDelete(deletingCategory)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Category Form Dialog
// -----------------------------------------------------------------------------

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSave: (cat: Category) => void;
  mode: "create" | "edit";
}

function CategoryFormDialog({ open, onOpenChange, category, onSave, mode }: CategoryFormDialogProps) {
  const { toast } = useToast();
  const isEdit = mode === "edit" && category;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast({ title: "Missing required fields", description: "Name and slug are required.", variant: "destructive" });
      return;
    }
    const newCategory: Partial<Category> & Pick<Category, "name" | "slug"> = {
      id: category?.id ?? `cat_${Date.now()}`,
      slug,
      name,
      description: description || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };
    onSave(newCategory as Category);
  }

  function generateSlug() {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Create Category"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update category details" : "Add a new product category"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="c-name">Name <span className="text-destructive">*</span></Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Feeding & Drinking Essentials" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-slug">Slug <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input id="c-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="feeding-drinking-essentials" required className="font-mono" />
              <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Generate</Button>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea id="c-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description..." className="min-h-[80px]" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-sort">Sort order</Label>
            <Input id="c-sort" type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="c-active" className="text-sm font-medium">Active</Label>
              <p className="text-xs text-muted-foreground">Inactive categories are hidden from the storefront</p>
            </div>
            <Switch id="c-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
