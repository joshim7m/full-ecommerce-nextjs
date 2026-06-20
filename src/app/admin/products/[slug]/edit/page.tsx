"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/products/product-form";
import { PRODUCTS } from "@/lib/mock-data";

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find((p) => p.slug === slug) ?? null;
  return <ProductForm product={product} mode="edit" />;
}
