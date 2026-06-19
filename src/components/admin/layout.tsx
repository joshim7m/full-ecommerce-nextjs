"use client";

import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, Settings,
  Baby, ArrowLeft, Menu, X, Bell, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store/app-store";
import { ORDERS } from "@/lib/mock-data";
import type { AdminView } from "@/lib/types";

const NAV_ITEMS: Array<{ name: AdminView["name"]; label: string; icon: typeof Package }> = [
  { name: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { name: "products", label: "Products", icon: Package },
  { name: "categories", label: "Categories", icon: Tag },
  { name: "orders", label: "Orders", icon: ShoppingCart },
  { name: "users", label: "Users", icon: Users },
  { name: "settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminView, setAdminView, setMode, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const pendingOrders = ORDERS.filter((o) => o.status === "PENDING").length;

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Baby className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-foreground">Baby Planet</div>
          <div className="-mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const active = adminView.name === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setAdminView({ name: item.name } as AdminView)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.name === "orders" && pendingOrders > 0 && (
                <Badge variant={active ? "secondary" : "destructive"} className="h-5 min-w-5 justify-center px-1 text-[10px]">
                  {pendingOrders}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to storefront */}
      <div className="border-t p-3">
        <button
          onClick={() => setMode("storefront")}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page title */}
          <div className="flex-1">
            <h1 className="text-lg font-bold capitalize text-foreground">{adminView.name}</h1>
            <p className="-mt-0.5 text-xs text-muted-foreground">
              {adminView.name === "dashboard" && "Overview of your store performance"}
              {adminView.name === "products" && "Manage your product catalog"}
              {adminView.name === "categories" && "Organize products into categories"}
              {adminView.name === "orders" && "Track and fulfill customer orders"}
              {adminView.name === "users" && "Manage user accounts and roles"}
              {adminView.name === "settings" && "Configure store settings"}
            </p>
          </div>

          {/* Search (decorative) */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Quick search..."
              className="h-9 w-48 rounded-full pl-9 lg:w-64"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {pendingOrders > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                {pendingOrders}
              </Badge>
            )}
          </Button>

          {/* User avatar */}
          <div className="flex items-center gap-2 border-l pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              AD
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold">Site Admin</div>
              <div className="text-[10px] text-muted-foreground">admin@babyplanet.bd</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
