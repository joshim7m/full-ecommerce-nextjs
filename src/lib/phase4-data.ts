// =============================================================================
// Phase 4 SEO/Perf/Infra data — for the in-app status dashboard
// =============================================================================

export const SEO_SCHEMAS = [
  {
    name: "Organization",
    type: "https://schema.org/Organization",
    location: "Root layout (every page)",
    purpose: "Google knowledge panel — name, logo, address, contact, social",
    color: "rose",
  },
  {
    name: "WebSite",
    type: "https://schema.org/WebSite",
    location: "Root layout",
    purpose: "Sitelinks search box — enables Google site search",
    color: "amber",
  },
  {
    name: "LocalBusiness",
    type: "https://schema.org/Store",
    location: "Root layout",
    purpose: "Local search + Google Maps listing",
    color: "emerald",
  },
  {
    name: "Product",
    type: "https://schema.org/Product",
    location: "Product detail pages",
    purpose: "Shopping rich results — price, stock, rating, shipping, returns",
    color: "blue",
  },
  {
    name: "BreadcrumbList",
    type: "https://schema.org/BreadcrumbList",
    location: "Every page with breadcrumbs",
    purpose: "Breadcrumb rich results in SERP",
    color: "purple",
  },
  {
    name: "CollectionPage",
    type: "https://schema.org/CollectionPage",
    location: "Category listing pages",
    purpose: "Category indexing with item count",
    color: "teal",
  },
  {
    name: "SearchResultsPage",
    type: "https://schema.org/SearchResultsPage",
    location: "Search page",
    purpose: "Search result indexing",
    color: "rose",
  },
] as const;

export const SITEMAP_RULES = [
  { path: "/", priority: "1.0", freq: "daily", count: 1 },
  { path: "/c/:slug", priority: "0.9", freq: "weekly", count: 5 },
  { path: "/p/:slug", priority: "0.8", freq: "weekly", count: 25 },
  { path: "/about, /contact, /faq", priority: "0.4–0.5", freq: "monthly", count: 5 },
  { path: "/terms, /privacy", priority: "0.3", freq: "yearly", count: 2 },
];

export const PERFORMANCE_FEATURES = [
  {
    title: "Image Optimization",
    description: "AVIF + WebP auto-negotiated. 8 responsive sizes (16px→1920px) for srcset.",
    metric: "−70% image weight",
    icon: "image",
  },
  {
    title: "Gzip + Brotli Compression",
    description: "Next.js handles Gzip at the framework level; NGINX adds Brotli at level 6 for text assets.",
    metric: "−80% transfer size",
    icon: "compress",
  },
  {
    title: "Static Asset Caching",
    description: "Content-addressed assets cached 1 year + immutable. Images 30d + SWR. Fonts 1y.",
    metric: "Instant repeat loads",
    icon: "cache",
  },
  {
    title: "Package Import Optimization",
    description: "Tree-shakes lucide-react, date-fns, class-variance-authority. Smaller client bundles.",
    metric: "−30% JS bundle",
    icon: "tree",
  },
  {
    title: "HTTP/2 + Connection Pooling",
    description: "NGINX serves HTTP/2 with keepalive connections to upstreams. Multiplexed requests.",
    metric: "−50% latency",
    icon: "http",
  },
  {
    title: "NGINX Upstream Caching",
    description: "API GET responses cached 5 min. Static 30d. Auth routes never cached. Cache bypass for authed users.",
    metric: "< 50ms TTFB",
    icon: "edge",
  },
] as const;

export const SECURITY_HEADERS = [
  { header: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload", source: "NGINX + Next.js" },
  { header: "X-Frame-Options", value: "DENY", source: "NGINX + Next.js" },
  { header: "X-Content-Type-Options", value: "nosniff", source: "NGINX + Next.js" },
  { header: "Referrer-Policy", value: "strict-origin-when-cross-origin", source: "NGINX + Next.js" },
  { header: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()", source: "NGINX + Next.js" },
  { header: "Content-Security-Policy", value: "default-src 'self'; ... (full CSP)", source: "NGINX + Next.js" },
  { header: "Cross-Origin-Opener-Policy", value: "same-origin", source: "NGINX + Next.js" },
  { header: "Cross-Origin-Resource-Policy", value: "same-site", source: "NGINX + Next.js" },
];

export const NGINX_RATE_LIMIT_ZONES = [
  { zone: "general", rate: "30 r/s", burst: 60, path: "All other routes", color: "emerald" },
  { zone: "api", rate: "10 r/s", burst: 20, path: "/api/*", color: "blue" },
  { zone: "auth", rate: "2 r/s", burst: 5, path: "/api/v1/auth/*", color: "amber" },
  { zone: "checkout", rate: "1 r/s", burst: 3, path: "/api/v1/orders", color: "rose" },
];

export const DOCKER_SERVICES = [
  { name: "nginx", image: "nginx:1.27-alpine", port: "80, 443", size: "~50 MB", role: "Reverse proxy + TLS + cache" },
  { name: "frontend", image: "Custom (Next.js standalone)", port: "3000 (internal)", size: "~120 MB", role: "Storefront + Admin UI" },
  { name: "backend", image: "Custom (Express + TS)", port: "4000 (internal)", size: "~80 MB", role: "REST API + Auth + Cache" },
  { name: "postgres", image: "postgres:16-alpine", port: "5432 (internal)", size: "~200 MB", role: "Primary database" },
  { name: "redis", image: "redis:7-alpine", port: "6379 (internal)", size: "~30 MB", role: "Cache + rate limit + sessions" },
  { name: "certbot", image: "certbot/certbot", port: "—", size: "~50 MB", role: "SSL auto-renewal (Let's Encrypt)" },
];

export const DEPLOYMENT_STEPS = [
  { step: 1, title: "Clone repo to VPS", cmd: "git clone <repo> /opt/babyplanet && cd /opt/babyplanet" },
  { step: 2, title: "Configure env", cmd: "cp .env.production.example .env.production && nano .env.production" },
  { step: 3, title: "Setup SSL (one-time)", cmd: "./deploy/setup-ssl.sh" },
  { step: 4, title: "Deploy!", cmd: "./deploy/deploy.sh" },
  { step: 5, title: "Visit store", cmd: "https://babyplanet-bd.com ✅" },
];

export const PHASE_4_FILES = [
  { path: "src/lib/seo.ts", desc: "JSON-LD schema generators + metadata helpers (8 schemas + 3 metadata builders)" },
  { path: "src/components/shared/json-ld.tsx", desc: "React component for injecting JSON-LD scripts" },
  { path: "src/app/sitemap.xml/route.ts", desc: "Dynamic sitemap with 38 URLs (home + 5 cats + 25 products + 7 static)" },
  { path: "src/app/robots.txt/route.ts", desc: "Dynamic robots.txt with crawler-specific rules" },
  { path: "src/app/manifest.webmanifest/route.ts", desc: "PWA manifest with shortcuts + theme color" },
  { path: "src/app/opengraph-image.tsx", desc: "Dynamic 1200×630 OG image via next/og" },
  { path: "src/app/layout.tsx", desc: "Updated: global JSON-LD + preconnect + verification tokens" },
  { path: "next.config.ts", desc: "Image opt + 11 security headers + cache rules + strict build" },
  { path: "nginx/nginx.conf", desc: "NGINX reverse proxy + Gzip/Brotli + SSL + 4 rate-limit zones + cache" },
  { path: "Dockerfile", desc: "Multi-stage frontend build → 120 MB Alpine image, non-root user" },
  { path: "Dockerfile.backend", desc: "Multi-stage backend build → 80 MB Alpine image, non-root user" },
  { path: "docker-compose.prod.yml", desc: "Production stack: 6 services with healthchecks + volumes" },
  { path: "deploy/deploy.sh", desc: "One-command deploy script (build + migrate + seed + SSL + verify)" },
  { path: "deploy/setup-ssl.sh", desc: "Initial Let's Encrypt SSL certificate setup" },
  { path: ".env.production.example", desc: "All production env vars documented" },
  { path: "DEPLOYMENT.md", desc: "Comprehensive deployment guide + troubleshooting" },
] as const;
