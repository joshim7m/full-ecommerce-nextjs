"use client";

import { StorefrontLayout } from "@/components/storefront/layout";
import { AdminLayout } from "@/components/admin/layout";
import { AdminDashboard } from "@/components/admin/pages/dashboard";
import { AdminProducts } from "@/components/admin/pages/products";
import { AdminCategories } from "@/components/admin/pages/categories";
import { AdminOrders } from "@/components/admin/pages/orders";
import { AdminUsers } from "@/components/admin/pages/users";
import { AdminSettings } from "@/components/admin/pages/settings";
import { AdminSeoPerf } from "@/components/admin/pages/seo-perf";
import { useAppStore } from "@/lib/store/app-store";

export default function Home() {
  const { mode, adminView } = useAppStore();

  if (mode === "admin") {
    return (
      <AdminLayout>
        {adminView.name === "dashboard" && <AdminDashboard />}
        {adminView.name === "products" && <AdminProducts />}
        {adminView.name === "categories" && <AdminCategories />}
        {adminView.name === "orders" && <AdminOrders />}
        {adminView.name === "users" && <AdminUsers />}
        {adminView.name === "seo-perf" && <AdminSeoPerf />}
        {adminView.name === "settings" && <AdminSettings />}
      </AdminLayout>
    );
  }

  return <StorefrontLayout />;
}
