// =============================================================================
// Phase 1 seed data — frontend mirror of backend/prisma/seed.ts
// -----------------------------------------------------------------------------
// Used by the Phase 1 dashboard to render a live preview of what the seeder
// will insert into PostgreSQL. Kept in sync with backend/prisma/seed.ts.
// =============================================================================

export type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  priceBdt: number;
  compareAtBdt?: number;
  sku: string;
  stock: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
};

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  sortOrder: number;
  products: SeedProduct[];
};

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "feeding-drinking-essentials",
    name: "Feeding & Drinking Essentials",
    emoji: "🍼",
    description:
      "Premium baby feeding bottles, sippers, and drinking accessories from trusted global brands like Philips Avent, Mumlove, Applebear, and Rovco. BPA-free, anti-colic, and pediatrician-recommended.",
    sortOrder: 1,
    products: [
      {
        slug: "philips-avent-natural-response-260ml",
        name: "Philips Avent Natural Response 260ml Bottle",
        shortDescription: "Anti-colic wide-neck bottle with Natural Response nipple.",
        priceBdt: 1250, compareAtBdt: 1500, sku: "PA-NR-260", stock: 84,
        isFeatured: true, isBestSeller: true,
      },
      {
        slug: "philips-avent-125ml-bottle",
        name: "Philips Avent 125ml Bottle",
        shortDescription: "Compact 125ml bottle ideal for newborns with anti-colic system.",
        priceBdt: 950, compareAtBdt: 1100, sku: "PA-125-SCY", stock: 120,
        isBestSeller: true,
      },
      {
        slug: "mumlove-glass-feeding-bottle",
        name: "Mumlove Glass Feeding Bottle",
        shortDescription: "Eco-friendly borosilicate glass bottle with silicone sleeve.",
        priceBdt: 850, compareAtBdt: 980, sku: "ML-GLS-240", stock: 56,
      },
      {
        slug: "applebear-wide-neck-pp-bottle",
        name: "Applebear Wide Neck PP Bottle",
        shortDescription: "Affordable 250ml wide-neck polypropylene bottle.",
        priceBdt: 350, sku: "AB-WN-250-PP", stock: 240,
      },
      {
        slug: "rovco-anti-colic-150ml-feeder",
        name: "Rovco Anti-Colic 150ml Feeder",
        shortDescription: "Compact 150ml anti-colic feeder with vented nipple.",
        priceBdt: 480, compareAtBdt: 560, sku: "RVC-AC-150", stock: 165,
      },
    ],
  },
  {
    slug: "mom-care-maternity",
    name: "Mom Care & Maternity",
    emoji: "🤱",
    description:
      "Everything a new or expecting mother needs: breast pumps, washable nursing pads, mommy bags, and postpartum essentials — handpicked for comfort, dignity, and convenience.",
    sortOrder: 2,
    products: [
      {
        slug: "intelligent-rh228-automatic-double-breast-pump",
        name: "Intelligent RH228 Automatic Double Breast Pump",
        shortDescription: "Hospital-grade double electric pump with 9 suction levels.",
        priceBdt: 4500, compareAtBdt: 5500, sku: "RH228-DBL", stock: 32,
        isFeatured: true, isBestSeller: true,
      },
      {
        slug: "only-baby-manual-breast-pump",
        name: "Only Baby Manual Breast Pump",
        shortDescription: "Lightweight manual pump with soft silicone horn.",
        priceBdt: 850, compareAtBdt: 990, sku: "OB-MAN-BP", stock: 78,
      },
      {
        slug: "baby-smile-washable-breast-pad-4pcs",
        name: "Baby Smile Washable Breast Pad (4 Pcs)",
        shortDescription: "Ultra-soft bamboo washable nursing pads — 4 piece pack.",
        priceBdt: 450, sku: "BS-WBP-4", stock: 200,
      },
      {
        slug: "momeasy-washable-breast-pad-6pcs",
        name: "Momeasy Washable Breast Pad (6 Pcs)",
        shortDescription: "Premium 6-piece pack of washable bamboo nursing pads.",
        priceBdt: 620, compareAtBdt: 750, sku: "ME-WBP-6", stock: 180,
      },
      {
        slug: "branded-multifunctional-crossbody-mommy-bag",
        name: "Branded Multifunctional Crossbody Mommy Bag",
        shortDescription: "Spacious crossbody diaper bag with insulated bottle pocket.",
        priceBdt: 1850, compareAtBdt: 2200, sku: "MM-CB-MULTI", stock: 45,
        isFeatured: true,
      },
    ],
  },
  {
    slug: "kids-kitchen-dining",
    name: "Kids Kitchen & Dining",
    emoji: "🍱",
    description:
      "Fun, safe, and durable dining solutions for little ones — tiffin boxes, lunch boxes, straw cups, and tableware designed for tiny hands and growing appetites.",
    sortOrder: 3,
    products: [
      {
        slug: "portable-car-design-tiffin-box",
        name: "Portable Car Design Tiffin Box",
        shortDescription: "Adorable 3-compartment car-shaped tiffin with locking clips.",
        priceBdt: 550, compareAtBdt: 680, sku: "KCH-CAR-TFN", stock: 95,
        isBestSeller: true,
      },
      {
        slug: "multifunctional-japanese-style-lunch-box",
        name: "Multifunctional Japanese-Style Lunch Box",
        shortDescription: "Stackable bento with chopsticks, sauce container, and strap.",
        priceBdt: 980, compareAtBdt: 1150, sku: "JP-BENTO-2T", stock: 62,
      },
      {
        slug: "creative-kids-double-layer-stainless-steel-lunch-box",
        name: "Creative Kids Double Layer Stainless Steel Lunch Box",
        shortDescription: "Durable 304-grade stainless steel leak-proof lunch box.",
        priceBdt: 1250, compareAtBdt: 1500, sku: "SS-2L-DBL", stock: 48,
        isFeatured: true,
      },
      {
        slug: "creative-baby-bus-straw-water-cup",
        name: "Creative Baby Bus Straw Water Cup",
        shortDescription: "Cute bus-shaped 300ml kids water bottle with flip-up straw.",
        priceBdt: 420, sku: "BUS-STRW-300", stock: 130,
      },
      {
        slug: "bamboo-fiber-kids-tableware-set",
        name: "Bamboo Fiber Kid's Tableware Set",
        shortDescription: "Eco-friendly 5-piece dining set from natural bamboo fiber.",
        priceBdt: 880, compareAtBdt: 1050, sku: "BFM-TW-5P", stock: 75,
      },
    ],
  },
  {
    slug: "baby-clothing-outfits",
    name: "Baby Clothing & Outfits",
    emoji: "👶",
    description:
      "Soft, breathable, skin-friendly clothing for every occasion — from daily cotton rompers to party frocks. Each piece is gentle on baby's delicate skin and built to survive countless wash cycles.",
    sortOrder: 4,
    products: [
      {
        slug: "kids-summer-short-sleeve-knitted-set",
        name: "Kids Summer Short-Sleeve Knitted Set",
        shortDescription: "Breathable 2-piece cotton knit set for hot summers.",
        priceBdt: 690, compareAtBdt: 850, sku: "CLTH-KNIT-SMR", stock: 110,
        isBestSeller: true,
      },
      {
        slug: "imported-bubble-print-two-piece-outfit",
        name: "Imported Bubble Print Two-Piece Outfit",
        shortDescription: "Trendy bubble-print 2-piece outfit with matching cap.",
        priceBdt: 980, compareAtBdt: 1200, sku: "CLTH-BUBL-2P", stock: 65,
      },
      {
        slug: "strawberry-design-baby-girl-party-frock",
        name: "Strawberry Design Baby Girl Party Frock",
        shortDescription: "Adorable strawberry-embroidered party frock with tulle.",
        priceBdt: 1450, compareAtBdt: 1750, sku: "CLTH-STRW-FRK", stock: 38,
        isFeatured: true,
      },
      {
        slug: "sunflower-design-pure-cotton-frock",
        name: "Sunflower Design Pure Cotton Frock",
        shortDescription: "Cheerful sunflower-print 100% cotton frock for daily wear.",
        priceBdt: 750, sku: "CLTH-SUN-FRK", stock: 88,
      },
      {
        slug: "cute-daily-cotton-essentials-romper",
        name: "Cute Daily Cotton Essentials Romper",
        shortDescription: "Pack of 3 everyday cotton rompers with snap closure.",
        priceBdt: 890, compareAtBdt: 1100, sku: "CLTH-RMP-3P", stock: 100,
        isBestSeller: true,
      },
    ],
  },
  {
    slug: "health-safety-grooming",
    name: "Health, Safety & Grooming",
    emoji: "🩺",
    description:
      "Keep your little one safe, healthy, and well-groomed with our curated range of nasal aspirators, nail trimmers, bottle cleansers, wet wipes, and grooming kits — all rigorously tested for baby safety.",
    sortOrder: 5,
    products: [
      {
        slug: "childrens-premium-imported-hair-comb",
        name: "Children's Premium Imported Hair Comb",
        shortDescription: "Dual-side wooden baby comb — fine and wide teeth.",
        priceBdt: 320, sku: "GRM-CMB-WD", stock: 220,
      },
      {
        slug: "safe-baby-nasal-aspirator",
        name: "Safe Baby Nasal Aspirator",
        shortDescription: "Gentle manual nasal aspirator with soft silicone tip.",
        priceBdt: 380, compareAtBdt: 480, sku: "HLT-NASL-MAN", stock: 145,
      },
      {
        slug: "kidlon-baby-bottle-cleanser-500ml",
        name: "Kidlon Baby Bottle Cleanser 500ml",
        shortDescription: "Plant-based bottle cleanser — no harsh chemicals.",
        priceBdt: 480, compareAtBdt: 580, sku: "HLT-CLN-500", stock: 175,
        isBestSeller: true,
      },
      {
        slug: "baby-wet-wipes-sensitive-80-pack",
        name: "Baby Wet Wipes Sensitive (80 Pack)",
        shortDescription: "Ultra-soft sensitive wipes — 99% pure water.",
        priceBdt: 220, sku: "HLT-WIP-80", stock: 380,
        isBestSeller: true,
      },
      {
        slug: "electric-baby-nail-trimmer",
        name: "Electric Baby Nail Trimmer",
        shortDescription: "Whisper-quiet electric nail trimmer with 6 heads.",
        priceBdt: 720, compareAtBdt: 900, sku: "HLT-NAIL-ELC", stock: 92,
        isFeatured: true,
      },
    ],
  },
];

export const SEED_STATS = {
  totalCategories: SEED_CATEGORIES.length,
  totalProducts: SEED_CATEGORIES.reduce((sum, c) => sum + c.products.length, 0),
  totalStock: SEED_CATEGORIES.reduce(
    (sum, c) => sum + c.products.reduce((s, p) => s + p.stock, 0),
    0,
  ),
  featuredCount: SEED_CATEGORIES.reduce(
    (sum, c) => sum + c.products.filter((p) => p.isFeatured).length,
    0,
  ),
  bestSellerCount: SEED_CATEGORIES.reduce(
    (sum, c) => sum + c.products.filter((p) => p.isBestSeller).length,
    0,
  ),
  inventoryRetailValueBdt: SEED_CATEGORIES.reduce(
    (sum, c) => sum + c.products.reduce((s, p) => s + p.priceBdt * p.stock, 0),
    0,
  ),
};
