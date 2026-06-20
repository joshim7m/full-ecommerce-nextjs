"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { apiClient } from "@/lib/api-client";
import type { Category } from "@/lib/types";

export default function EditCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    apiClient(`/categories/${slug}`)
      .then((data: any) => setCategory(data))
      .catch(() => setCategory(null));
  }, [slug]);

  if (category === undefined) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  return <CategoryForm category={category} mode="edit" />;
}
