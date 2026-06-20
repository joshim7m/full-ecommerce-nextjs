"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";

interface CategoryFormProps {
  category?: Category | null;
  mode: "create" | "edit";
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = mode === "edit" && category;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  function generateSlug() {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast({ title: "Missing required fields", description: "Name and slug are required.", variant: "destructive" });
      return;
    }

    try {
      const payload = { name, slug, description: description || null, sortOrder: Number(sortOrder) || 0, isActive };
      if (isEdit) {
        await apiClient(`/categories/${category!.slug}`, { method: "PUT", body: JSON.stringify(payload) });
        toast({ title: "Category updated", description: name });
      } else {
        await apiClient("/categories", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Category created", description: name });
      }
      router.push("/admin/categories");
    } catch (err: any) {
      toast({ title: isEdit ? "Failed to update" : "Failed to create", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isEdit ? "Edit Category" : "Create Category"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update category details" : "Add a new product category"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Name, slug and visibility settings</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="flex items-center gap-3 border-t pt-4">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
