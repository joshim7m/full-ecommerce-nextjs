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
  TicketPercent,
  Layers,
  ShieldCheck,
  Hash,
  FileCode2,
  FolderTree,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEED_CATEGORIES, SEED_STATS } from "@/lib/seed-data";

// -----------------------------------------------------------------------------
// Static config data for the dashboard
// -----------------------------------------------------------------------------

const STACK_LAYERS = [
  {
    name: "Frontend",
    icon: Cpu,
    color: "text-rose-700 bg-rose-50 border-rose-200",
    items: [
      "Next.js 16 (App Router)",
      "React 19",
      "Tailwind CSS 4",
      "Shadcn/UI + Lucide",
      "Zustand + TanStack Query",
    ],
  },
  {
    name: "Backend",
    icon: Server,
    color: "text-amber-700 bg-amber-50 border-amber-200",
    items: [
      "Node.js + Express 4",
      "TypeScript 5 (strict)",
      "JWT + Google OAuth 2.0",
      "Helmet + Rate Limit (Redis store)",
      "Zod request validation",
    ],
  },
  {
    name: "Data Layer",
    icon: Database,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    items: [
      "PostgreSQL 16",
      "Prisma ORM 6",
      "Redis 7 (ioredis)",
      "Explicit @@index strategy",
      "BigInt paisa pricing",
    ],
  },
  {
    name: "DevOps",
    icon: Container,
    color: "text-teal-700 bg-teal-50 border-teal-200",
    items: [
      "Docker Compose",
      "NGINX reverse proxy (Phase 4)",
      "Adminer + RedisInsight",
      "DigitalOcean / Hostinger ready",
      "Health check probes",
    ],
  },
] as const;

const PHASE_1_DELIVERABLES = [
  { icon: Container, label: "docker-compose.yml", desc: "PostgreSQL 16 + Redis 7 + Adminer + RedisInsight" },
  { icon: FolderTree, label: "backend/ folder structure", desc: "Express + TS + Prisma + Redis — full scaffold" },
  { icon: FileCode2, label: "backend/package.json", desc: "All runtime + dev dependencies pinned" },
  { icon: Database, label: "prisma/schema.prisma", desc: "PostgreSQL schema with explicit @@index rules" },
  { icon: Package, label: "prisma/seed.ts", desc: "25 real products, 5 categories, real ৳ pricing" },
  { icon: KeyRound, label: ".env.example", desc: "Every secret + connection string documented" },
  { icon: ShieldCheck, label: "Health endpoint", desc: "/api/v1/health — Docker + uptime probe" },
  { icon: FileCode2, label: "Express entry + middlewares", desc: "Helmet, CORS, rate-limit, error handler" },
] as const;

const PRISMA_MODELS = [
  { name: "User", icon: Users, fields: ["id (cuid)", "email @unique", "phone @unique", "role", "googleId @unique", "refreshTokenHash"], indexes: 4 },
  { name: "Category", icon: Tag, fields: ["id (cuid)", "slug @unique", "parentId (self-ref)", "sortOrder", "isActive"], indexes: 4 },
  { name: "Product", icon: Package, fields: ["id (cuid)", "slug @unique", "sku @unique", "pricePaisa BigInt", "categoryId FK", "status", "isFeatured"], indexes: 11 },
  { name: "Order", icon: TrendingUp, fields: ["id (cuid)", "orderNumber @unique", "userId FK?", "status", "paymentStatus", "totalPaisa BigInt"], indexes: 7 },
  { name: "OrderItem", icon: Boxes, fields: ["id (cuid)", "orderId FK", "productId FK", "unitPricePaisa BigInt", "quantity"], indexes: 3 },
  { name: "Review", icon: Sparkles, fields: ["id (cuid)", "userId FK", "productId FK", "rating (1..5)", "status"], indexes: 5 },
] as const;

const FILE_TREE = [
  { depth: 0, name: "babyplanet-clone/", type: "root" },
  { depth: 1, name: "docker-compose.yml", type: "file", note: "PostgreSQL + Redis + Adminer + RedisInsight" },
  { depth: 1, name: "next.config.ts", type: "file", note: "Next.js 16 config" },
  { depth: 1, name: "package.json", type: "file", note: "Frontend deps" },
  { depth: 1, name: "src/", type: "folder" },
  { depth: 2, name: "app/", type: "folder" },
  { depth: 3, name: "page.tsx", type: "file", note: "This dashboard" },
  { depth: 3, name: "layout.tsx", type: "file", note: "Root layout + metadata" },
  { depth: 2, name: "lib/", type: "folder" },
  { depth: 3, name: "seed-data.ts", type: "file", note: "Frontend mirror of backend seeder" },
  { depth: 1, name: "backend/", type: "folder", note: "Express API" },
  { depth: 2, name: "package.json", type: "file", note: "express, prisma, ioredis, jwt, passport-google, bcryptjs" },
  { depth: 2, name: "tsconfig.json", type: "file", note: "NodeNext + strict" },
  { depth: 2, name: ".env.example", type: "file", note: "All env vars documented" },
  { depth: 2, name: "prisma/", type: "folder" },
  { depth: 3, name: "schema.prisma", type: "file", note: "PostgreSQL — 9 models, 38+ @@index" },
  { depth: 3, name: "seed.ts", type: "file", note: "25 products + 3 users + coupon" },
  { depth: 2, name: "src/", type: "folder" },
  { depth: 3, name: "index.ts", type: "file", note: "Express bootstrap" },
  { depth: 3, name: "config/", type: "folder" },
  { depth: 4, name: "env.ts", type: "file", note: "Typed env loader" },
  { depth: 4, name: "prisma.ts", type: "file", note: "Prisma client singleton" },
  { depth: 4, name: "redis.ts", type: "file", note: "Redis + cache helpers + key builders" },
  { depth: 4, name: "logger.ts", type: "file", note: "Leveled logger" },
  { depth: 3, name: "routes/", type: "folder" },
  { depth: 4, name: "health.routes.ts", type: "file", note: "/api/v1/health" },
  { depth: 3, name: "middlewares/", type: "folder" },
  { depth: 4, name: "error-handler.middleware.ts", type: "file" },
  { depth: 4, name: "not-found.middleware.ts", type: "file" },
] as const;

const PHASE_2_PREVIEW = [
  { label: "JWT auth + Google OAuth", icon: KeyRound },
  { label: "Role-based middleware (admin/user)", icon: ShieldCheck },
  { label: "Category CRUD controllers", icon: Tag },
  { label: "Product CRUD controllers", icon: Package },
  { label: "Order state machine (PENDING→PROCESSING→SHIPPED→COMPLETED|CANCELLED)", icon: TrendingUp },
  { label: "Redis cache layer with invalidation hooks", icon: Zap },
  { label: "Rate-limited auth routes", icon: ShieldCheck },
  { label: "Express route mounting", icon: GitBranch },
] as const;

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
                    Production-ready e-commerce foundation · Phase 1 complete
                  </p>
                </div>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                A high-end, full-stack clone of <span className="font-semibold text-foreground">babyplanet-bd.com</span> built
                with Next.js 16, Express, PostgreSQL, Prisma, and Redis. Phase 1 ships the project scaffold,
                Prisma schema with explicit indexing, and a realistic 25-product seeder.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Phase 1 · Complete
                </Badge>
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                  <GitBranch className="mr-1 h-3 w-3" /> Phase 2 · Awaiting go-ahead
                </Badge>
                <Badge variant="outline">Next.js 16</Badge>
                <Badge variant="outline">Express 4</Badge>
                <Badge variant="outline">PostgreSQL 16</Badge>
                <Badge variant="outline">Prisma 6</Badge>
                <Badge variant="outline">Redis 7</Badge>
                <Badge variant="outline">Docker</Badge>
              </div>
            </div>

            {/* Phase progress card */}
            <Card className="w-full max-w-sm border-2 border-primary/20 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" />
                  Build Progress
                </CardTitle>
                <CardDescription className="text-xs">
                  4-phase delivery plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0 text-sm">
                {[
                  { phase: "Phase 1", title: "Init · Models · Seeders", done: true },
                  { phase: "Phase 2", title: "Express API · Auth · Redis", done: false },
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

        {/* ====================================================== DELIVERABLES */}
        <section className="mb-12">
          <SectionTitle
            kicker="Phase 1 deliverables"
            title="What shipped in this phase"
            subtitle="Every file listed below has been generated end-to-end with no placeholders or TODOs."
          />
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                {PHASE_1_DELIVERABLES.map((d) => (
                  <div key={d.label} className="flex items-start gap-3 p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <d.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-xs font-semibold text-foreground">{d.label}</code>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ====================================================== SEEDED CATALOG */}
        <section className="mb-12">
          <SectionTitle
            kicker="Seeded catalog"
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
                          <Badge variant="secondary" className="font-mono text-xs">
                            #{idx + 1}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1 max-w-2xl text-xs leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        slug: {category.slug}
                      </Badge>
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
                        <h4 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                          {product.shortDescription}
                        </p>
                        <div className="mt-auto flex items-end justify-between pt-2">
                          <div>
                            <div className="font-mono text-base font-bold text-primary">
                              {formatBdt(product.priceBdt)}
                            </div>
                            {product.compareAtBdt && (
                              <div className="font-mono text-xs text-muted-foreground line-through">
                                {formatBdt(product.compareAtBdt)}
                              </div>
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

        {/* ====================================================== PRISMA SCHEMA */}
        <section className="mb-12">
          <SectionTitle
            kicker="Database schema"
            title="Prisma models & indexing strategy"
            subtitle="9 models with explicit @@index on every foreign-key column and @@unique on every natural key. Prices stored as integer paisa (BigInt) to avoid float drift."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRISMA_MODELS.map((model) => (
              <Card key={model.name} className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-mono text-base">
                      <model.icon className="h-4 w-4 text-primary" />
                      {model.name}
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      <Hash className="mr-1 h-2.5 w-2.5" />
                      {model.indexes} idx
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                  {model.fields.map((field) => (
                    <div key={field} className="font-mono text-xs text-muted-foreground">
                      <span className="text-foreground/80">·</span> {field}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ====================================================== FILE TREE */}
        <section className="mb-12">
          <SectionTitle
            kicker="Project structure"
            title="File tree of what was generated"
            subtitle="Two top-level projects: Next.js storefront (root) and Express backend (backend/)."
          />
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-5 font-mono text-xs sm:text-sm">
                <pre className="overflow-x-auto leading-relaxed">
                  {FILE_TREE.map((node, i) => {
                    const indent = "  ".repeat(node.depth);
                    const icon = node.type === "folder" ? "📁" : node.type === "root" ? "🏠" : "📄";
                    return (
                      <div key={i} className="flex items-baseline gap-2 whitespace-pre-wrap break-all">
                        <span>{indent}{icon} </span>
                        <span className={node.type === "folder" || node.type === "root" ? "font-semibold text-foreground" : "text-foreground/80"}>
                          {node.name}
                        </span>
                        {node.note && (
                          <span className="text-muted-foreground">— {node.note}</span>
                        )}
                      </div>
                    );
                  })}
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ====================================================== PHASE 2 PREVIEW */}
        <section className="mb-12">
          <SectionTitle
            kicker="Next up"
            title="Phase 2 — Express Backend Core API, Auth & Redis"
            subtitle="Awaiting your go-ahead. Phase 2 will deliver the full auth flow, CRUD endpoints, and the Redis cache layer with invalidation hooks."
          />
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              {PHASE_2_PREVIEW.map((item) => (
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
            <span className="font-semibold text-foreground">Phase 1 is ready for your review.</span>{" "}
            Run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">docker compose up -d</code> then{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">cd backend && npm install && npx prisma migrate dev && npm run prisma:seed</code>{" "}
            to bring up PostgreSQL + Redis and seed all 25 products.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Reply <span className="font-semibold text-primary">"proceed to Phase 2"</span> when you are ready.
          </p>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Baby Planet BD Clone · Phase 1 deliverable · Built with Next.js 16, Express 4, PostgreSQL 16, Prisma 6, Redis 7
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
