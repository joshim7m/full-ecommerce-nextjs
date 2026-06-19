// =============================================================================
// Cart Store — Zustand
// -----------------------------------------------------------------------------
// Persistent cart state with add/remove/update/clear actions. Persists to
// localStorage so cart survives page refresh. In production this would sync
// with the backend /api/v1/cart endpoint for authenticated users.
// =============================================================================

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "../types";

interface CartState {
  items: Array<{ productId: string; product: Product; quantity: number }>;
  isOpen: boolean;
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  // Computed getters
  getTotalItems: () => number;
  getSubtotalBdt: () => number;
  getShippingBdt: (address?: string) => number;
  getTotalBdt: (address?: string) => number;
}

const SHIPPING_INSIDE_DHAKA = 60;
const SHIPPING_OUTSIDE_DHAKA = 120;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                : i,
            ),
            isOpen: true, // Auto-open drawer when adding
          });
        } else {
          set({
            items: [...get().items, { productId: product.id, product, quantity: Math.min(quantity, product.stock) }],
            isOpen: true,
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.product.stock) }
              : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotalBdt: () =>
        get().items.reduce((sum, i) => sum + i.product.priceBdt * i.quantity, 0),

      getShippingBdt: (address) => {
        if (get().items.length === 0) return 0;
        const insideDhaka = address?.toLowerCase().includes("dhaka") ?? true;
        return insideDhaka ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA;
      },

      getTotalBdt: (address) => {
        const subtotal = get().getSubtotalBdt();
        const shipping = get().getShippingBdt(address);
        return subtotal + shipping;
      },
    }),
    {
      name: "babyplanet-cart",
      storage: createJSONStorage(() => localStorage),
      // Don't persist the isOpen state — drawer should always start closed
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
