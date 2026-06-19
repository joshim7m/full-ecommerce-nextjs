import {
  Baby,
  Database,
  Server,
  Boxes,
  Container,
  KeyRound,
  Zap,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Package,
  Tag,
  Users,
  Layers,
  ShieldCheck,
  Hash,
  FileCode2,
  FolderTree,
  Cpu,
  Cookie,
  RefreshCw,
  Lock,
  Check,
  Rocket,
  CircleDollarSign,
  ShoppingCart,
  Truck,
  X,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEED_CATEGORIES, SEED_STATS } from "@/lib/seed-data";
import { API_GROUPS, AUTH_FEATURES, REDIS_CACHE_RULES, ORDER_STATE_MACHINE } from "@/lib/phase2-data";

// -----------------------------------------------------------------------------
// Static config data
// -----------------------------------------------------------------------------

const STACK_LAYERS = [
  {
    name: "Frontend",
    icon: Cpu,
    color: "text-rose-700 bg-rose-50 border-rose-200",
    items: ["Next.js 16 (App Router)", "React 19", "Tailwind CSS 4", "Shadcn/UI + Lucide", "Zustand + TanStack Query"],
  },
  {
    name: "Backend",
    icon: Server,
    color: "text-amber-700 bg-amber-50 border-amber-200",
    items: ["Node.js + Express 4", "TypeScript 5 (strict)", "JWT + Google OAuth 2.0", "Helmet + Rate Limit (Redis store)", "Zod request validation"],
  },
  {
    name: "Data Layer",
    icon: Database,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    items: ["PostgreSQL 16", "Prisma ORM 6", "Redis 7 (ioredis)", "Explicit @@index strategy", "BigInt paisa pricing"],
  },
  {
    name: "DevOps",
    icon: Container,
    color: "text-teal-700 bg-teal-50 border-teal-200",
    items: ["Docker Compose", "NGINX reverse proxy (Phase 4)", "Adminer + RedisInsight", "DigitalOcean / Hostinger ready", "Health check probes"],
  },
] as const;

const PHASE_2_DELIVERABLES = [
  { icon: KeyRound, label: "auth.service.ts + auth.controller.ts", desc: "JWT register / login / refresh / logout + Google OAuth upsert" },
  { icon: ShieldCheck, label: "auth.middleware.ts", desc: "authenticate + requireRole('ADMIN') + optionalAuth helpers" },
  { icon: FileCode2, label: "config/passport.ts", desc: "Google OAuth 2.0 strategy via passport-google-oauth20" },
  { icon: Tag, label: "category.service + controller + routes", desc: "Full CRUD with Redis cache + invalidation" },
  { icon: Package, label: "product.service + controller + routes", desc: "CRUD + pagination + filters + 5 cache keys + invalidation" },
  { icon: ShoppingCart, label: "order.service + controller + routes", desc: "State machine + atomic stock decrement + coupons" },
  { icon: Check, label: "4 Zod validators", desc: "auth, category, product, order — every endpoint validated" },
  { icon: Zap, label: "Redis cache layer", desc: "7 cache key patterns with TTLs + invalidation on every mutation" },
  { icon: Truck, label: "Order state machine", desc: "PENDING → PROCESSING → SHIPPED → COMPLETED | CANCELLED" },
  { icon: CircleDollarSign, label: "Order number generator", desc: "BP-YYYY-NNNNNN via atomic Redis INCR" },
  { icon: FileCode2, label: "5 utils + 2 middlewares", desc: "jwt, async-handler, api-response, order-number, paisa + validate middleware" },
  { icon: ShieldCheck, label: "Security hardening", desc: "HttpOnly cookies, refresh rotation, bcrypt cost 12, helmet, rate-limit-redis" },
] as const;

const PHASE_3_PREVIEW = [
  { label: "Sticky nav header + mobile drawer", icon: Layers },
  { label: "Debounced search bar", icon: Search },
  { label: "Cart drawer (Zustand state)", icon: ShoppingCart },
  { label: "4-field Bangla checkout (Name, Mobile, Address, Note)", icon: Check },
  { label: "Admin dashboard w/ shadcn data-tables", icon: Server },
  { label: "CRUD modals (Create/Read/Update/Delete)", icon: Package },
  { label: "Order management with status badges", icon: TrendingUp },
  { label: "Product grid + product detail page", icon: Sparkles },
] as const;

// Imported for type-safe icon usage in the Phase 3 preview
function Search(props: { className?: string }) {
  return <Package {...props} />;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-800 border-emerald-200",
  POST: "bg-amber-100 text-amber-800 border-amber-200",
  PUT: "bg-blue-100 text-blue-800 border-blue-200",
  PATCH: "bg-purple-100 text-purple-800 border-purple-200",
  DELETE: "bg-rose-100 text-rose-800 border-rose-200",
};

const AUTH_COLORS: Record<string, string> = {
  Public: "bg-muted text-muted-foreground",
  Bearer: "bg-blue-50 text-blue-700 border-blue-200",
  Admin: "bg-rose-50 text-rose-700 border-rose-200",
  Cookie: "bg-amber-50 text-amber-700 border-amber-200",
};

const AUTH_ICONS: Record<string, typeof KeyRound> = {
  cookie: Cookie,
  refresh: RefreshCw,
  google: KeyRound,
  shield: ShieldCheck,
  lock: Lock,
  check: Check,
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD")}`;
}

function formatCompactBdt(value: number): string {
  if (value >= 100000) return `৳${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `৳${(value / 1000).toFixed(1)}k`;
  return `৳${value}`;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ====================================================== HERO */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.94 0.04 75) 0, transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.94 0.04 25) 0, transparent 40%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Baby className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    Baby Planet BD Clone
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Production-ready e-commerce foundation · Phase 2 complete
                  </p>
                </div>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                A high-end, full-stack clone of <span className="font-semibold text-foreground">babyplanet-bd.com</span> built
                with Next.js 16, Express, PostgreSQL, Prisma, and Redis. Phase 2 ships the full
                Express API — JWT + Google OAuth, role-based middleware, CRUD for Categories /
                Products / Orders, and a Redis cache layer with instant invalidation.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Phase 1 · Complete
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Phase 2 · Complete
                </Badge>
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                  <GitBranch className="mr-1 h-3 w-3" /> Phase 3 · Awaiting go-ahead
                </Badge>
                <Badge variant="outline">Next.js 16</Badge>
                <Badge variant="outline">Express 4</Badge>
                <Badge variant="outline">JWT + OAuth</Badge>
                <Badge variant="outline">Redis Cache</Badge>
              </div>
            </div>

            <Card className="w-full max-w-sm border-2 border-primary/20 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" />
                  Build Progress
                </CardTitle>
                <CardDescription className="text-xs">4-phase delivery plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0 text-sm">
                {[
                  { phase: "Phase 1", title: "Init · Models · Seeders", done: true },
                  { phase: "Phase 2", title: "Express API · Auth · Redis", done: true },
                  { phase: "Phase 3", title: "Storefront · Admin UI", done: false },
                  { phase: "Phase 4", title: "SEO · NGINX · Perf", done: false },
                ].map((p) => (
                  <div key={p.phase} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${p.done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      {p.done ? <CheckCircle2 className="h-4 w-4" /> : p.phase.split(" ")[1]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium leading-tight">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.phase}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* ====================================================== STATS */}
        <section className="mb-12">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Tag} label="Categories" value={SEED_STATS.totalCategories} accent="rose" />
            <StatCard icon={Package} label="Products" value={SEED_STATS.totalProducts} accent="amber" />
            <StatCard icon={Boxes} label="Stock units" value={SEED_STATS.totalStock} accent="emerald" />
            <StatCard icon={Sparkles} label="Featured" value={SEED_STATS.featuredCount} accent="teal" />
            <StatCard icon={TrendingUp} label="Best sellers" value={SEED_STATS.bestSellerCount} accent="rose" />
            <StatCard icon={Database} label="Inventory value" value={formatCompactBdt(SEED_STATS.inventoryRetailValueBdt)} accent="amber" />
          </div>
        </section>

        {/* ====================================================== PHASE 2 BANNER */}
        <section className="mb-12">
          <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                <Rocket className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  Phase 2 is live — Express API, Auth & Redis cache layer
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <span className="font-semibold text-foreground">38 new files</span> · JWT auth with refresh rotation · Google OAuth 2.0 ·
                  role-based middleware · CRUD for Categories, Products, Orders · order state machine ·
                  Redis cache with instant invalidation on every admin mutation · Zod validation on every endpoint.
                </p>
              </div>
              <Badge className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Ready for integration
              </Badge>
            </CardContent>
          </Card>
        </section>

        {/* ====================================================== API ENDPOINTS */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 2 · API surface"
            title="38 endpoints across 4 route groups"
            subtitle="Every endpoint is documented, Zod-validated, and rate-limited. Public routes are cached in Redis; admin mutations invalidate the cache instantly."
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {API_GROUPS.map((group) => (
              <Card key={group.name} className="overflow-hidden border-border/60">
                <CardHeader className="bg-gradient-to-r from-accent/60 to-accent/20 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{group.emoji}</span>
                    {group.name}
                    <code className="ml-auto font-mono text-xs text-muted-foreground">{group.basePath}</code>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {group.endpoints.map((ep) => (
                      <div key={`${ep.method}-${ep.path}`} className="flex items-start gap-3 p-3 hover:bg-muted/30">
                        <Badge variant="outline" className={`w-16 shrink-0 justify-center font-mono text-[10px] font-bold ${METHOD_COLORS[ep.method]}`}>
                          {ep.method}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs font-semibold text-foreground">{ep.path}</code>
                            <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${AUTH_COLORS[ep.auth]}`}>
                              {ep.auth}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{ep.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ====================================================== AUTH FEATURES */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 2 · Auth architecture"
            title="JWT + Google OAuth with refresh rotation"
            subtitle="Defense-in-depth: HttpOnly cookies immune to XSS, refresh rotation for breach detection, role-based middleware for admin endpoints."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AUTH_FEATURES.map((feat) => {
              const Icon = AUTH_ICONS[feat.icon] ?? KeyRound;
              return (
                <Card key={feat.title} className="border-border/60">
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-sm font-semibold">{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs leading-relaxed text-muted-foreground">{feat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ====================================================== REDIS CACHE */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 2 · Redis cache layer"
            title="7 cache key patterns with TTLs + invalidation rules"
            subtitle="Every read endpoint is cached. Every admin mutation wipes matching keys via cache.delByPattern() in a single SCAN loop."
          />
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cache key pattern</th>
                      <th className="px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">TTL</th>
                      <th className="px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invalidated by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {REDIS_CACHE_RULES.map((rule) => (
                      <tr key={rule.pattern} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <code className="font-mono text-xs text-foreground">{rule.pattern}</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="font-mono text-[10px]">{rule.ttl}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{rule.invalidatedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ====================================================== ORDER STATE MACHINE */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 2 · Order state machine"
            title="Valid transitions enforced server-side"
            subtitle="The order.service.updateOrderStatus() function rejects invalid transitions with a 400 error showing the allowed next states."
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Valid transitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {ORDER_STATE_MACHINE.transitions.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <Badge variant="outline" className="font-mono text-xs uppercase">{t.from}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-mono text-xs uppercase">{t.to}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Side-effect rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {ORDER_STATE_MACHINE.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{rule}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[
                    { s: "PENDING", c: "bg-amber-100 text-amber-800" },
                    { s: "PROCESSING", c: "bg-blue-100 text-blue-800" },
                    { s: "SHIPPED", c: "bg-purple-100 text-purple-800" },
                    { s: "COMPLETED", c: "bg-emerald-100 text-emerald-800" },
                    { s: "CANCELLED", c: "bg-rose-100 text-rose-800" },
                  ].map((badge) => (
                    <div key={badge.s} className={`rounded-md px-2 py-1.5 text-center font-mono text-[10px] font-bold ${badge.c}`}>
                      {badge.s}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ====================================================== PHASE 2 DELIVERABLES */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 2 · Deliverables"
            title="What shipped in this phase"
            subtitle="38 new files — every line of code end-to-end, no placeholders, no TODOs."
          />
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
                {PHASE_2_DELIVERABLES.map((d) => (
                  <div key={d.label} className="flex items-start gap-3 p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <d.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-xs font-semibold text-foreground">{d.label}</code>
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ====================================================== ARCHITECTURE */}
        <section className="mb-12">
          <SectionTitle
            kicker="Architecture"
            title="Four-layer production stack"
            subtitle="Each layer is independently deployable and horizontally scalable on DigitalOcean or Hostinger VPS."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STACK_LAYERS.map((layer) => (
              <Card key={layer.name} className="border-border/60 transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg border ${layer.color}`}>
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{layer.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 pt-0">
                  {layer.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ====================================================== SEEDED CATALOG (collapsed) */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 1 · Seeded catalog"
            title="25 real products across 5 categories"
            subtitle="Mirrors the dataset in backend/prisma/seed.ts — real brand names, real ৳ pricing, all ready to migrate."
          />
          <div className="space-y-5">
            {SEED_CATEGORIES.map((category, idx) => (
              <Card key={category.slug} className="overflow-hidden border-border/60">
                <CardHeader className="bg-gradient-to-r from-accent/50 to-accent/20 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-2xl shadow-sm">
                        {category.emoji}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {category.name}
                          <Badge variant="secondary" className="font-mono text-xs">#{idx + 1}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-1 max-w-2xl text-xs leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="font-mono text-xs">slug: {category.slug}</Badge>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        {category.products.length} products
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5 lg:divide-y-0">
                    {category.products.map((product, pIdx) => (
                      <div key={product.slug} className={`flex flex-col gap-2 p-4 ${pIdx >= 1 ? "sm:border-t lg:border-t-0" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {String(pIdx + 1).padStart(2, "0")}
                          </span>
                          <div className="flex gap-1">
                            {product.isFeatured && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 px-1.5 py-0 text-[10px]">
                                <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Featured
                              </Badge>
                            )}
                            {product.isBestSeller && (
                              <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-100 px-1.5 py-0 text-[10px]">
                                <TrendingUp className="mr-0.5 h-2.5 w-2.5" /> Best
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h4 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">{product.name}</h4>
                        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{product.shortDescription}</p>
                        <div className="mt-auto flex items-end justify-between pt-2">
                          <div>
                            <div className="font-mono text-base font-bold text-primary">{formatBdt(product.priceBdt)}</div>
                            {product.compareAtBdt && (
                              <div className="font-mono text-xs text-muted-foreground line-through">{formatBdt(product.compareAtBdt)}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-[10px] text-muted-foreground">stock</div>
                            <div className="font-mono text-xs font-semibold text-foreground">{product.stock}</div>
                          </div>
                        </div>
                        <Separator className="my-1" />
                        <code className="font-mono text-[10px] text-muted-foreground">{product.sku}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ====================================================== PHASE 3 PREVIEW */}
        <section className="mb-12">
          <SectionTitle
            kicker="Next up"
            title="Phase 3 — Storefront & Admin UI"
            subtitle="Awaiting your go-ahead. Phase 3 will deliver the full Next.js storefront and admin dashboard."
          />
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              {PHASE_3_PREVIEW.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ====================================================== FOOTER NOTE */}
        <section className="rounded-xl border border-border/60 bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Phase 2 is ready for your review.</span>{" "}
            Backend is live with all 38 endpoints. Frontend integration will happen in Phase 3.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Reply <span className="font-semibold text-primary">"proceed to Phase 3"</span> when you are ready for the storefront + admin dashboard.
          </p>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Baby Planet BD Clone · Phase 2 deliverable · Next.js 16 + Express 4 + PostgreSQL 16 + Prisma 6 + Redis 7 + JWT + Google OAuth
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: "rose" | "amber" | "emerald" | "teal";
}) {
  const accentMap = {
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col items-start gap-2 p-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${accentMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{kicker}</div>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
