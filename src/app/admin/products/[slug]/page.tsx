"use client";

import { useParams } from "next/navigation";
import { ProductDetail } from "@/components/admin/products/product-detail";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return <ProductDetail slug={slug} />;
}
