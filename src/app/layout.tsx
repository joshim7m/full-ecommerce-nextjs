import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/shared/json-ld";
import { organizationSchema, websiteSchema, localBusinessSchema, SITE_CONFIG, buildMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// -----------------------------------------------------------------------------
// Root metadata — applies to every page unless overridden
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    path: "/",
    image: SITE_CONFIG.ogImage,
  }),
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  keywords: [
    "baby products Bangladesh",
    "baby bottles",
    "breast pump",
    "Philips Avent",
    "mom care",
    "baby clothing",
    "kids dining",
    "baby grooming",
    "Cash on Delivery",
    "Dhaka delivery",
    "Baby Planet BD",
  ],
  category: "e-commerce",
  // Verification tokens — replace with real values from each console
  verification: {
    google: "google-site-verification-token-here",
    other: {
      "msvalidate.01": "bing-verification-token-here",
      "facebook-domain-verification": "facebook-verification-token-here",
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  // Asset hints
  assets: [SITE_CONFIG.logo, SITE_CONFIG.ogImage],
};

export const viewport: Viewport = {
    themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff4d80" },
    { media: "(prefers-color-scheme: dark)", color: "#be185d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Global JSON-LD: Organization + WebSite + LocalBusiness */}
        <JsonLd
          schema={[
            organizationSchema(),
            websiteSchema(),
            localBusinessSchema(),
          ]}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
