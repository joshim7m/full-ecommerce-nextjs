// =============================================================================
// SEO Utilities — JSON-LD schema generators + metadata helpers
// -----------------------------------------------------------------------------
// Central place for all structured-data schemas. Each function returns a plain
// object that can be embedded via <script type="application/ld+json"> or
// returned from generateMetadata() for OG/Twitter cards.
// =============================================================================

import type { Metadata } from "next";

// -----------------------------------------------------------------------------
// Site-wide constants — single source of truth
// -----------------------------------------------------------------------------

export const SITE_CONFIG = {
  name: "Baby Planet BD",
  shortName: "BabyPlanet",
  domain: "babyplanet-bd.com",
  url: "https://babyplanet-bd.com",
  apiUrl: "https://api.babyplanet-bd.com",
  description:
    "Bangladesh's trusted destination for premium baby products — feeding bottles, breast pumps, baby clothing, mom care essentials, and more. Cash on Delivery available.",
  tagline: "Everything your baby needs, delivered with love.",
  locale: "en_BD",
  language: "en",
  country: "BD",
  currency: "BDT",
  currencySymbol: "৳",
  timezone: "Asia/Dhaka",
  // Contact / business
  phone: "+8801711000000",
  email: "hello@babyplanet.bd",
  address: {
    streetAddress: "Level 4, Plot 37, Gulshan Avenue",
    addressLocality: "Dhaka",
    addressRegion: "Dhaka",
    postalCode: "1212",
    addressCountry: "BD",
  },
  geo: { latitude: 23.7806, longitude: 90.2792 },
  // Social
  social: {
    facebook: "https://facebook.com/babyplanetbd",
    instagram: "https://instagram.com/babyplanetbd",
    youtube: "https://youtube.com/@babyplanetbd",
    twitter: "@babyplanetbd",
  },
  // Logo / brand assets
  logo: "https://babyplanet-bd.com/logo.png",
  logoWidth: 512,
  logoHeight: 512,
  ogImage: "https://babyplanet-bd.com/og-default.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  // Search
  searchUrl: "https://babyplanet-bd.com/search?q=",
} as const;

// -----------------------------------------------------------------------------
// Types — mirror our domain models
// -----------------------------------------------------------------------------

interface ProductSchemaInput {
  slug: string;
  name: string;
  description: string;
  priceBdt: number;
  compareAtBdt?: number | null;
  currency?: string;
  images: string[];
  sku?: string | null;
  barcode?: string | null;
  stock: number;
  status: string;
  visibility: string;
  ratingAverage: number;
  ratingCount: number;
  categoryName?: string;
  categorySlug?: string;
  brand?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
  image?: string;
}

interface CategorySchemaInput {
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  productCount?: number;
}

// =============================================================================
// JSON-LD SCHEMA GENERATORS
// =============================================================================

/**
 * Organization schema — embedded in the root layout.
 * Powers Google's knowledge panel for brand searches.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    logo: {
      "@type": "ImageObject",
      url: SITE_CONFIG.logo,
      width: SITE_CONFIG.logoWidth,
      height: SITE_CONFIG.logoHeight,
    },
    image: SITE_CONFIG.logo,
    description: SITE_CONFIG.description,
    foundingDate: "2023",
    founders: [{ "@type": "Person", name: "Baby Planet BD Team" }],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE_CONFIG.phone,
        contactType: "customer service",
        email: SITE_CONFIG.email,
        areaServed: "BD",
        availableLanguage: ["English", "Bengali"],
      },
    ],
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.youtube,
    ],
  };
}

/**
 * WebSite schema — embedded in root layout.
 * Enables Google sitelinks search box.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.searchUrl}{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-BD",
  };
}

/**
 * Product schema — embedded on product detail pages.
 * Powers Google Shopping rich results (price, availability, rating).
 */
export function productSchema(input: ProductSchemaInput) {
  const availability =
    input.status === "OUT_OF_STOCK" || input.stock === 0
      ? "https://schema.org/OutOfStock"
      : input.status === "DISCONTINUED"
        ? "https://schema.org/Discontinued"
        : "https://schema.org/InStock";

  const offers: Record<string, unknown> = {
    "@type": "Offer",
    url: `${SITE_CONFIG.url}/p/${input.slug}`,
    priceCurrency: input.currency ?? SITE_CONFIG.currency,
    price: input.priceBdt.toFixed(2),
    availability,
    itemCondition: "https://schema.org/NewCondition",
    priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split("T")[0],
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "60.00",
        currency: SITE_CONFIG.currency,
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "BD",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "BD",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_CONFIG.url}/p/${input.slug}#product`,
    name: input.name,
    description: input.description || input.name,
    image: input.images.length > 0 ? input.images : [SITE_CONFIG.ogImage],
    sku: input.sku ?? undefined,
    gtin13: input.barcode ?? undefined,
    brand: {
      "@type": "Brand",
      name: input.brand ?? "Baby Planet BD",
    },
    category: input.categoryName,
    url: `${SITE_CONFIG.url}/p/${input.slug}`,
    offers,
  };

  // Add aggregate rating only if there are reviews
  if (input.ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.ratingAverage.toFixed(1),
      reviewCount: input.ratingCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}

/**
 * BreadcrumbList schema — embedded on every page with breadcrumbs.
 * Powers Google's breadcrumb rich results.
 */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
      image: item.image,
    })),
  };
}

/**
 * CollectionPage schema — for category listing pages.
 */
export function collectionPageSchema(input: CategorySchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_CONFIG.url}/c/${input.slug}#collection`,
    name: input.name,
    description: input.description,
    url: `${SITE_CONFIG.url}/c/${input.slug}`,
    image: input.imageUrl ?? undefined,
    isPartOf: { "@id": `${SITE_CONFIG.url}/#website` },
    numberOfItems: input.productCount,
  };
}

/**
 * SearchResultsPage schema — for search results.
 */
export function searchResultsSchema(query: string, resultCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `Search results for "${query}"`,
    url: `${SITE_CONFIG.searchUrl}${encodeURIComponent(query)}`,
    mainContent: {
      "@type": "ItemList",
      numberOfItems: resultCount,
    },
  };
}

/**
 * FAQPage schema — for FAQ sections (optional, ready for future use).
 */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/**
 * LocalBusiness schema — combines Organization + physical store.
 * Use if Baby Planet BD has a physical retail location.
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_CONFIG.url}/#store`,
    name: SITE_CONFIG.name,
    image: SITE_CONFIG.logo,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    priceRange: "৳৳",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    sameAs: [SITE_CONFIG.social.facebook, SITE_CONFIG.social.instagram, SITE_CONFIG.social.youtube],
  };
}

// =============================================================================
// METADATA HELPERS — for Next.js generateMetadata()
// =============================================================================

interface BaseMetadataInput {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Build a complete Metadata object with consistent OG + Twitter + canonical.
 * Use this as the base for every page's generateMetadata().
 */
export function buildMetadata(input: BaseMetadataInput): Metadata {
  const url = input.path ? `${SITE_CONFIG.url}${input.path}` : SITE_CONFIG.url;
  const image = input.image ?? SITE_CONFIG.ogImage;
  const title = input.title.includes(SITE_CONFIG.name)
    ? input.title
    : `${input.title} | ${SITE_CONFIG.name}`;

  return {
    title,
    description: input.description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: SITE_CONFIG.locale,
      url,
      siteName: SITE_CONFIG.name,
      title,
      description: input.description,
      images: [
        {
          url: image,
          width: SITE_CONFIG.ogImageWidth,
          height: SITE_CONFIG.ogImageHeight,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_CONFIG.social.twitter,
      title,
      description: input.description,
      images: [image],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

/**
 * Build product-specific metadata with OG product tags.
 */
export function buildProductMetadata(input: ProductSchemaInput): Metadata {
  const title = input.name;
  const description = input.description || input.shortDescription || input.name;
  const url = `${SITE_CONFIG.url}/p/${input.slug}`;
  const image = input.images[0] ?? SITE_CONFIG.ogImage;

  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: { canonical: url },
    robots: {
      index: input.visibility === "PUBLISHED" && input.status === "ACTIVE",
      follow: true,
      googleBot: {
        index: input.visibility === "PUBLISHED" && input.status === "ACTIVE",
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "product",
      locale: SITE_CONFIG.locale,
      url,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: input.images.map((img) => ({
        url: img,
        width: 800,
        height: 800,
        alt: title,
      })),
      product: {
        price: input.priceBdt,
        currency: input.currency ?? SITE_CONFIG.currency,
        availability:
          input.status === "OUT_OF_STOCK" || input.stock === 0
            ? "oos"
            : "instock",
        condition: "new",
      },
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_CONFIG.social.twitter,
      title,
      description,
      images: [image],
    },
  };
}

/**
 * Build category/collection page metadata.
 */
export function buildCategoryMetadata(input: CategorySchemaInput): Metadata {
  const title = input.name;
  const description = input.description;
  const url = `${SITE_CONFIG.url}/c/${input.slug}`;

  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: SITE_CONFIG.locale,
      url,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: input.imageUrl
        ? [{ url: input.imageUrl, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_CONFIG.social.twitter,
      title,
      description,
      images: input.imageUrl ? [input.imageUrl] : undefined,
    },
  };
}
