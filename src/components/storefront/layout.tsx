"use client";

import { StorefrontHeader } from "./header";
import { StorefrontFooter } from "./footer";
import { CartDrawer } from "./cart-drawer";
import { StorefrontHome } from "./pages/home";
import { StorefrontCategory } from "./pages/category";
import { StorefrontProduct } from "./pages/product";
import { StorefrontSearch } from "./pages/search";
import { StorefrontCheckout } from "./pages/checkout";
import { StorefrontOrderSuccess } from "./pages/order-success";
import { useAppStore } from "@/lib/store/app-store";

export function StorefrontLayout() {
  const { storefrontView } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StorefrontHeader />
      <CartDrawer />
      <main className="flex-1">
        {storefrontView.name === "home" && <StorefrontHome />}
        {storefrontView.name === "category" && <StorefrontCategory slug={storefrontView.slug} />}
        {storefrontView.name === "product" && <StorefrontProduct slug={storefrontView.slug} />}
        {storefrontView.name === "search" && <StorefrontSearch query={storefrontView.query} />}
        {storefrontView.name === "checkout" && <StorefrontCheckout />}
        {storefrontView.name === "order-success" && (
          <StorefrontOrderSuccess orderNumber={storefrontView.orderNumber} />
        )}
      </main>
      <StorefrontFooter />
    </div>
  );
}
