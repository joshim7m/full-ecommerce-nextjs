// =============================================================================
// Dynamic Sitemap — /sitemap.xml
// -----------------------------------------------------------------------------
// Generates a sitemap listing all static pages + all 25 products + 5 categories.
// In production this would fetch from the Express API; in the sandbox it uses
// the in-memory catalog.
//
// URL priority & change frequency:
//   • Homepage           — 1.0  daily
//   • Category pages     — 0.9  weekly
//   • Product pages      — 0.8  weekly
//   • Static pages       — 0.5  monthly
// =============================================================================

import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";

export const dynamic = "force-static";
export const revalidate = 3600; // regenerate every hour in production

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // 1. Homepage
  entries.push({
    url: SITE_CONFIG.url,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  });

  // 2. Category pages
  for (const category of CATEGORIES) {
    entries.push({
      url: `${SITE_CONFIG.url}/c/${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // 3. Product pages — only PUBLISHED + ACTIVE products
  for (const product of PRODUCTS) {
    if (product.status !== "ACTIVE" || product.visibility !== "PUBLISHED") continue;
    entries.push({
      url: `${SITE_CONFIG.url}/p/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
      images: product.images.slice(0, 3),
    });
  }

  // 4. Static pages
  const staticPages = [
    { path: "/about", priority: 0.5, freq: "monthly" as const },
    { path: "/contact", priority: 0.5, freq: "monthly" as const },
    { path: "/shipping-policy", priority: 0.4, freq: "monthly" as const },
    { path: "/returns", priority: 0.4, freq: "monthly" as const },
    { path: "/faq", priority: 0.4, freq: "monthly" as const },
    { path: "/terms", priority: 0.3, freq: "yearly" as const },
    { path: "/privacy", priority: 0.3, freq: "yearly" as const },
  ];
  for (const p of staticPages) {
    entries.push({
      url: `${SITE_CONFIG.url}${p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    });
  }

  return entries;
}
