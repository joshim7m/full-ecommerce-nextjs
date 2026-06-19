// =============================================================================
// Next.js Production Configuration
// -----------------------------------------------------------------------------
// Phase 4 optimizations:
//   • Standalone output (minimal Docker image)
//   • Image optimization with AVIF + WebP, responsive sizes
//   • Strict security headers (CSP, HSTS, X-Frame-Options, etc.)
//   • Compression enabled (Gzip at Next level; Brotli at NGINX)
//   • Package import optimization for tree-shaking
//   • Modern React 19 features enabled
// =============================================================================

import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Force HTTPS for 2 years (incl. subdomains + preload list)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block clickjacking — never allow this site in an iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Disable XSS auditor (modern browsers handle this; legacy support)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Referrer policy — only send origin to cross-origin, full to same-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy — lock down sensitive APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
  // Content Security Policy — strict but allows inline styles (Next.js needs them)
  // In production, replace 'unsafe-inline' with nonces or hashes.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob: http://localhost:4000",
      "media-src 'self' https:",
      "connect-src 'self' http://localhost:4000 https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Cross-Origin policies for isolated context
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig: NextConfig = {
  // Output mode — produces a minimal self-contained bundle for Docker
  output: "standalone",

  // React strict mode (we disabled in Phase 1-3 to avoid double-effects in dev;
  // re-enabled for production safety)
  reactStrictMode: true,

  // ---------------------------------------------------------------------------
  // Image optimization
  // ---------------------------------------------------------------------------
  images: {
    // Modern formats — browsers negotiate automatically
    formats: ["image/avif", "image/webp"],
    // Responsive sizing — generates 6 sizes for srcset
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow placeholder.co images in the demo
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "https", hostname: "babyplanet-bd.com" },
      { protocol: "https", hostname: "cdn.babyplanet-bd.com" },
    ],
    // Cache optimized images for 60 seconds on CDN, 30 days in browser
    minimumCacheTTL: 60,
    // Lazy loading + async decode for below-the-fold images
    dangerouslyAllowSVG: false,
  },

  // ---------------------------------------------------------------------------
  // Compression
  // ---------------------------------------------------------------------------
  compress: true, // Gzip at Next level (NGINX also does Brotli)

  // ---------------------------------------------------------------------------
  // Power features (stable in Next 16)
  // ---------------------------------------------------------------------------
  experimental: {
    // Tree-shake unused lodash-style imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "class-variance-authority",
    ],
    // Build-time fetch caching for generateMetadata / generateStaticParams
    // cacheLife: true,  // available in Next 16 stable; uncomment after upgrading
  },

  // ---------------------------------------------------------------------------
  // Static page generation
  // ---------------------------------------------------------------------------
  // Generate static HTML for known product + category pages at build time
  // (In production with real DB, use generateStaticParams in route segments)
  // dynamicParams: true,

  // ---------------------------------------------------------------------------
  // Security headers — applied to every response
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // Cache static assets aggressively (1 year — content-addressed by hash)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache optimized images for 30 days
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        // Cache fonts for 1 year
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Robots.txt — short cache so updates propagate fast
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      {
        // Sitemap.xml — 1 hour cache
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      {
        // Manifest — 24 hour cache
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },

  // ---------------------------------------------------------------------------
  // Redirects — clean URLs
  // ---------------------------------------------------------------------------
  async redirects() {
    return [
      // Trailing slash normalization (301 permanent)
      { source: "/home", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },
      // Legacy URL migrations
      { source: "/products", destination: "/catalog", permanent: true },
      { source: "/shop", destination: "/catalog", permanent: true },
    ];
  },

  // ---------------------------------------------------------------------------
  // Build tolerance — Phase 4 enforces zero TS errors at build time
  // ---------------------------------------------------------------------------
  typescript: {
    ignoreBuildErrors: false,
    // TS errors will now fail the production build
  },
  // ESLint is enforced separately via `bun run lint` in CI/CD pipelines.
  // Next.js 16 removed the `eslint` config key — use `next lint` directly.

  // ---------------------------------------------------------------------------
  // Production source maps — generate but don't serve to public
  // ---------------------------------------------------------------------------
  productionBrowserSourceMaps: false,
};

export default nextConfig;
