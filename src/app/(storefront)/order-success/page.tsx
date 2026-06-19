import { StorefrontOrderSuccess } from "@/components/storefront/pages/order-success";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ orderNumber?: string }> }) {
  const { orderNumber } = await searchParams;
  return <StorefrontOrderSuccess orderNumber={orderNumber ?? ""} />;
}
