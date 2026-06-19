// =============================================================================
// Web App Manifest — /manifest.webmanifest
// -----------------------------------------------------------------------------
// Enables PWA installability + adds theme color metadata for Android/Chrome.
// =============================================================================

import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f0",
    theme_color: "#b45309",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-BD",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "baby", "ecommerce"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shop Feeding Essentials",
        short_name: "Feeding",
        url: "/c/feeding-drinking-essentials",
      },
      {
        name: "Mom Care & Maternity",
        short_name: "Mom Care",
        url: "/c/mom-care-maternity",
      },
      {
        name: "Baby Clothing",
        short_name: "Clothing",
        url: "/c/baby-clothing-outfits",
      },
    ],
  };
}
