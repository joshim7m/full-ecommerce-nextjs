// =============================================================================
// Phase 2 API surface — endpoint definitions for the dashboard
// =============================================================================

export type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: "Public" | "Bearer" | "Admin" | "Cookie";
  description: string;
};

export type ApiGroup = {
  name: string;
  emoji: string;
  basePath: string;
  endpoints: ApiEndpoint[];
};

export const API_GROUPS: ApiGroup[] = [
  {
    name: "Auth",
    emoji: "🔐",
    basePath: "/api/v1/auth",
    endpoints: [
      { method: "POST", path: "/register", auth: "Public", description: "Email + password registration" },
      { method: "POST", path: "/login", auth: "Public", description: "Email + password login → sets HttpOnly cookies" },
      { method: "POST", path: "/refresh", auth: "Cookie", description: "Exchange refresh token → new access token (rotation)" },
      { method: "POST", path: "/logout", auth: "Public", description: "Clears cookies, revokes refresh token in DB" },
      { method: "GET", path: "/me", auth: "Bearer", description: "Get current user profile" },
      { method: "PATCH", path: "/me", auth: "Bearer", description: "Update name / phone / avatar" },
      { method: "POST", path: "/change-password", auth: "Bearer", description: "Change password (invalidates all sessions)" },
      { method: "GET", path: "/google", auth: "Public", description: "Redirect to Google consent screen" },
      { method: "GET", path: "/google/callback", auth: "Public", description: "Handle Google redirect → issue JWTs" },
    ],
  },
  {
    name: "Categories",
    emoji: "📂",
    basePath: "/api/v1/categories",
    endpoints: [
      { method: "GET", path: "/", auth: "Public", description: "List all active categories (cached 10 min)" },
      { method: "GET", path: "/:slug", auth: "Public", description: "Get category by slug (cached 5 min)" },
      { method: "POST", path: "/", auth: "Admin", description: "Create category → invalidates category cache" },
      { method: "PUT", path: "/:slug", auth: "Admin", description: "Update category → invalidates cache" },
      { method: "DELETE", path: "/:slug", auth: "Admin", description: "Delete (blocks if has products)" },
    ],
  },
  {
    name: "Products",
    emoji: "🛍️",
    basePath: "/api/v1/products",
    endpoints: [
      { method: "GET", path: "/", auth: "Public", description: "Paginated list w/ filters + sort (cached 5 min)" },
      { method: "GET", path: "/featured", auth: "Public", description: "Featured products (cached 5 min)" },
      { method: "GET", path: "/best-sellers", auth: "Public", description: "Best sellers (cached 5 min)" },
      { method: "GET", path: "/:slug", auth: "Public", description: "Product detail by slug (cached 2 min)" },
      { method: "GET", path: "/:slug/related", auth: "Public", description: "Related products in same category" },
      { method: "POST", path: "/", auth: "Admin", description: "Create product → invalidates all product + category cache" },
      { method: "PUT", path: "/:id", auth: "Admin", description: "Update product → invalidates cache" },
      { method: "DELETE", path: "/:id", auth: "Admin", description: "Delete (soft-delete if has order history)" },
    ],
  },
  {
    name: "Orders",
    emoji: "📦",
    basePath: "/api/v1/orders",
    endpoints: [
      { method: "POST", path: "/", auth: "Public", description: "Create order — guest checkout supported" },
      { method: "GET", path: "/", auth: "Bearer", description: "List own orders (admin sees all)" },
      { method: "GET", path: "/:id", auth: "Bearer", description: "Get order by ID (own or admin)" },
      { method: "GET", path: "/stats", auth: "Admin", description: "Dashboard stats (revenue, status counts, AOV)" },
      { method: "PATCH", path: "/:id/status", auth: "Admin", description: "Update status (state-machine-validated)" },
    ],
  },
];

export const AUTH_FEATURES = [
  {
    title: "JWT in HttpOnly cookies",
    description: "Access (15m) + Refresh (7d) tokens stored as HttpOnly cookies — immune to XSS token theft.",
    icon: "cookie",
  },
  {
    title: "Refresh token rotation",
    description: "Every /auth/refresh issues a new refresh token and invalidates the previous one — breach detection built-in.",
    icon: "refresh",
  },
  {
    title: "Google OAuth 2.0",
    description: "passport-google-oauth20 strategy. Upserts user by googleId or email, links to existing accounts.",
    icon: "google",
  },
  {
    title: "Role-based access control",
    description: "authenticate middleware + requireRole('ADMIN') gate. Optional auth for mixed public/private endpoints.",
    icon: "shield",
  },
  {
    title: "bcryptjs password hashing",
    description: "Cost factor 12 — ~250ms per hash, slow enough to deter brute force, fast enough for UX.",
    icon: "lock",
  },
  {
    title: "Zod request validation",
    description: "Every endpoint validates body, query, and params with Zod schemas. 422 + detailed errors on failure.",
    icon: "check",
  },
] as const;

export const REDIS_CACHE_RULES = [
  { pattern: "products:list:{base64(params)}", ttl: "5 min", invalidatedBy: "Product create/update/delete, Order create" },
  { pattern: "products:detail:{slug}", ttl: "2 min", invalidatedBy: "Product update/delete, Order status change (stock)" },
  { pattern: "products:featured", ttl: "5 min", invalidatedBy: "Product create/update/delete" },
  { pattern: "products:bestsellers", ttl: "5 min", invalidatedBy: "Product create/update/delete, Order create" },
  { pattern: "categories:list:{params}", ttl: "10 min", invalidatedBy: "Category create/update/delete, Product mutations" },
  { pattern: "categories:detail:{slug}", ttl: "5 min", invalidatedBy: "Category create/update/delete" },
  { pattern: "order:seq:year:{YYYY}", ttl: "400 days", invalidatedBy: "Never — atomic INCR counter for order numbers" },
];

export const ORDER_STATE_MACHINE = {
  transitions: [
    { from: "PENDING", to: "PROCESSING", color: "amber", icon: "▶" },
    { from: "PENDING", to: "CANCELLED", color: "rose", icon: "✕" },
    { from: "PROCESSING", to: "SHIPPED", color: "blue", icon: "🚚" },
    { from: "PROCESSING", to: "CANCELLED", color: "rose", icon: "✕" },
    { from: "SHIPPED", to: "COMPLETED", color: "emerald", icon: "✓" },
    { from: "SHIPPED", to: "CANCELLED", color: "rose", icon: "✕" },
  ],
  rules: [
    "On SHIPPED: requires trackingNumber, sets shippedAt, paymentStatus=PENDING",
    "On COMPLETED: sets deliveredAt, paymentStatus=PAID",
    "On CANCELLED: returns stock to inventory, sets cancelledAt",
    "COMPLETED and CANCELLED are terminal — cannot transition further",
  ],
};
