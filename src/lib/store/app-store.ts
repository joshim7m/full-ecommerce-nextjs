// =============================================================================
// App Navigation Store — Zustand
// -----------------------------------------------------------------------------
// Simulates a router in the sandbox (only `/` is exposed externally).
// In production these would be Next.js App Router routes:
//   /            → storefront home
//   /c/:slug     → category
//   /p/:slug     → product
//   /search?q=   → search results
//   /checkout    → checkout
//   /admin       → admin dashboard
// =============================================================================

"use client";

import { create } from "zustand";
import type { AppMode, StorefrontView, AdminView } from "../types";

interface AppState {
  mode: AppMode;
  storefrontView: StorefrontView;
  adminView: AdminView;
  mobileMenuOpen: boolean;

  // Navigation
  setMode: (mode: AppMode) => void;
  setStorefrontView: (view: StorefrontView) => void;
  setAdminView: (view: AdminView) => void;
  goHome: () => void;
  goCategory: (slug: string) => void;
  goProduct: (slug: string) => void;
  goSearch: (query: string) => void;
  goCheckout: () => void;
  goOrderSuccess: (orderNumber: string) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "storefront",
  storefrontView: { name: "home" },
  adminView: { name: "dashboard" },
  mobileMenuOpen: false,

  setMode: (mode) => set({ mode, mobileMenuOpen: false }),
  setStorefrontView: (view) => set({ storefrontView: view, mobileMenuOpen: false }),
  setAdminView: (view) => set({ adminView: view, mobileMenuOpen: false }),

  goHome: () => set({ storefrontView: { name: "home" }, mode: "storefront", mobileMenuOpen: false }),
  goCategory: (slug) => set({ storefrontView: { name: "category", slug }, mode: "storefront", mobileMenuOpen: false }),
  goProduct: (slug) => set({ storefrontView: { name: "product", slug }, mode: "storefront", mobileMenuOpen: false }),
  goSearch: (query) => set({ storefrontView: { name: "search", query }, mode: "storefront", mobileMenuOpen: false }),
  goCheckout: () => set({ storefrontView: { name: "checkout" }, mode: "storefront", mobileMenuOpen: false }),
  goOrderSuccess: (orderNumber) => set({ storefrontView: { name: "order-success", orderNumber }, mode: "storefront", mobileMenuOpen: false }),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
