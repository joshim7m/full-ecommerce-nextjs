import { StorefrontSearch } from "@/components/storefront/pages/search";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <StorefrontSearch query={q ?? ""} />;
}
