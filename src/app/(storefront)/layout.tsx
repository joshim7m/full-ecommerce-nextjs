"use client";

import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
