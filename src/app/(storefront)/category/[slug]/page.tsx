import { StorefrontCategory } from "@/components/storefront/pages/category";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StorefrontCategory slug={slug} />;
}
