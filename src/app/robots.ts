// =============================================================================
// Dynamic robots.txt — /robots.txt
// -----------------------------------------------------------------------------
// Allows all major crawlers, points them to the sitemap, and blocks /admin,
// /api, /checkout (cart), and account pages from indexing.
// =============================================================================

import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/checkout",
          "/cart",
          "/account",
          "/account/*",
          "/orders",
          "/orders/*",
          "/wishlist",
          "/_next",
          "/_next/*",
        ],
      },
      // Explicitly allow social media crawlers to access images for rich previews
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
