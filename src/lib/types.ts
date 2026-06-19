// =============================================================================
// Shared Types — storefront + admin
// =============================================================================

export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
export type ProductVisibility = "PUBLISHED" | "HIDDEN";
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH" | "NAGAD" | "ROCKET" | "CARD";
export type UserRole = "USER" | "ADMIN" | "MANAGER";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  priceBdt: number;
  compareAtBdt: number | null;
  costBdt: number | null;
  currency: string;
  sku: string | null;
  barcode: string | null;
  stock: number;
  lowStockThreshold: number;
  weightGrams: number | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  isFeatured: boolean;
  isBestSeller: boolean;
  ratingAverage: number;
  ratingCount: number;
  salesCount: number;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  images: string[];
  keyFeatures: string[];
  tags: string[];
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  unitPriceBdt: number;
  quantity: number;
  lineTotalBdt: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  note: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotalBdt: number;
  shippingCostBdt: number;
  discountBdt: number;
  totalBdt: number;
  trackingNumber: string | null;
  courierName: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  createdAt: string;
}

// -----------------------------------------------------------------------------
// View router types — Phase 3 uses a state-based router (sandbox only exposes /)
// -----------------------------------------------------------------------------

export type StorefrontView =
  | { name: "home" }
  | { name: "category"; slug: string }
  | { name: "product"; slug: string }
  | { name: "search"; query: string }
  | { name: "checkout" }
  | { name: "order-success"; orderNumber: string };

export type AdminView =
  | { name: "dashboard" }
  | { name: "products" }
  | { name: "categories" }
  | { name: "orders" }
  | { name: "users" }
  | { name: "settings" };

export type AppMode = "storefront" | "admin";
