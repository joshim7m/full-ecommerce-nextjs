// =============================================================================
// Dynamic OpenGraph Image — /opengraph-image
// -----------------------------------------------------------------------------
// Generates a branded 1200×630 OG image at the root level (used as default
// fallback for the homepage and any page that doesn't define its own).
//
// Per-page OG images can be created by adding an `opengraph-image.tsx` file
// to a route segment (e.g. src/app/p/[slug]/opengraph-image.tsx).
// =============================================================================

import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/seo";

export const runtime = "edge";
export const alt = `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)",
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 35,
            background: "#b45309",
            color: "white",
            fontSize: 80,
            marginBottom: 40,
            boxShadow: "0 20px 60px rgba(180, 83, 9, 0.3)",
          }}
        >
          🍼
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#7c2d12",
            marginBottom: 16,
            letterSpacing: -1,
          }}
        >
          {SITE_CONFIG.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#92400e",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          {SITE_CONFIG.tagline}
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 20,
          }}
        >
          {["Cash on Delivery", "100% Authentic", "Fast Dhaka Delivery"].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 28px",
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: 50,
                fontSize: 22,
                fontWeight: 600,
                color: "#7c2d12",
                border: "2px solid rgba(180, 83, 9, 0.2)",
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Bottom URL strip */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: "#92400e",
            opacity: 0.8,
          }}
        >
          🇧🇩 {SITE_CONFIG.domain}
        </div>
      </div>
    ),
    { ...size },
  );
}
