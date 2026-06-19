import { StorefrontProduct } from "@/components/storefront/pages/product";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StorefrontProduct slug={slug} />;
}
