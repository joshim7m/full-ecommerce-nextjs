// =============================================================================
// Mock Data Layer — in-memory storefront + admin data
// -----------------------------------------------------------------------------
// In production this would be replaced by TanStack Query hooks calling the
// Express API. In the sandbox preview, this provides a fully interactive
// demo without requiring the backend to be running.
// =============================================================================

import type { Category, Product, Order, User, OrderStatus } from "./types";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function placeholderImage(text: string, w = 800, h = 800, bg = "FDE68A", fg = "7C2D12"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#${fg}" font-family="sans-serif" font-size="${Math.round(w / 20)}">${escapeXml(text)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

// -----------------------------------------------------------------------------
// Categories (5)
// -----------------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  {
    id: "cat_feeding",
    slug: "feeding-drinking-essentials",
    name: "Feeding & Drinking Essentials",
    description: "Premium baby feeding bottles, sippers, and drinking accessories from trusted global brands.",
    imageUrl: placeholderImage("Feeding & Drinking", 1200, 800),
    iconUrl: placeholderImage("🍼", 200, 200),
    sortOrder: 1,
    isActive: true,
    parentId: null,
    productCount: 5,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
  },
  {
    id: "cat_mom",
    slug: "mom-care-maternity",
    name: "Mom Care & Maternity",
    description: "Breast pumps, washable nursing pads, mommy bags, and postpartum essentials.",
    imageUrl: placeholderImage("Mom Care & Maternity", 1200, 800),
    iconUrl: placeholderImage("🤱", 200, 200),
    sortOrder: 2,
    isActive: true,
    parentId: null,
    productCount: 5,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
  },
  {
    id: "cat_kitchen",
    slug: "kids-kitchen-dining",
    name: "Kids Kitchen & Dining",
    description: "Tiffin boxes, lunch boxes, straw cups, and tableware for tiny hands.",
    imageUrl: placeholderImage("Kids Kitchen & Dining", 1200, 800),
    iconUrl: placeholderImage("🍱", 200, 200),
    sortOrder: 3,
    isActive: true,
    parentId: null,
    productCount: 5,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "cat_clothing",
    slug: "baby-clothing-outfits",
    name: "Baby Clothing & Outfits",
    description: "Soft, breathable, skin-friendly clothing for every occasion.",
    imageUrl: placeholderImage("Baby Clothing & Outfits", 1200, 800),
    iconUrl: placeholderImage("👶", 200, 200),
    sortOrder: 4,
    isActive: true,
    parentId: null,
    productCount: 5,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  },
  {
    id: "cat_health",
    slug: "health-safety-grooming",
    name: "Health, Safety & Grooming",
    description: "Nasal aspirators, nail trimmers, bottle cleansers, wet wipes, and grooming kits.",
    imageUrl: placeholderImage("Health, Safety & Grooming", 1200, 800),
    iconUrl: placeholderImage("🩺", 200, 200),
    sortOrder: 5,
    isActive: true,
    parentId: null,
    productCount: 5,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(7),
  },
];

// -----------------------------------------------------------------------------
// Products (25)
// -----------------------------------------------------------------------------

type ProductSeed = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceBdt: number;
  compareAtBdt?: number;
  costBdt?: number;
  sku: string;
  stock: number;
  categoryId: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  keyFeatures: string[];
  tags: string[];
};

const PRODUCT_SEEDS: ProductSeed[] = [
  // ---- Feeding & Drinking (cat_feeding) ----
  {
    slug: "philips-avent-natural-response-260ml",
    name: "Philips Avent Natural Response 260ml Bottle",
    shortDescription: "Anti-colic wide-neck bottle with Natural Response nipple.",
    description: "The Philips Avent Natural Response 260ml feeding bottle is designed to mimic the natural breastfeeding experience. Its Natural Response nipple only releases milk when baby actively drinks, reducing spit-up and overeating. The wide-neck design makes cleaning effortless, and the AirFree vent keeps air out of baby's tummy to reduce colic. BPA-free and dishwasher safe.",
    priceBdt: 1250, compareAtBdt: 1500, costBdt: 820,
    sku: "PA-NR-260", stock: 84, categoryId: "cat_feeding",
    isFeatured: true, isBestSeller: true,
    keyFeatures: ["Natural Response nipple — baby controls the flow", "Anti-colic AirFree vent integrated", "BPA-free polypropylene body", "Wide-neck design for easy cleaning", "Compatible with all Philips Avent Natural nipples"],
    tags: ["bottle", "anti-colic", "philips", "avent", "newborn"],
  },
  {
    slug: "philips-avent-125ml-bottle",
    name: "Philips Avent 125ml Bottle",
    shortDescription: "Compact 125ml bottle ideal for newborns with anti-colic system.",
    description: "The Philips Avent 125ml feeding bottle is the perfect size for newborns and small feeds. Featuring the proven Avent anti-colic system integrated into the nipple, it reduces colic and discomfort. The soft silicone nipple feels natural to baby and the ergonomic shape is easy for parents to hold during feeds.",
    priceBdt: 950, compareAtBdt: 1100, costBdt: 620,
    sku: "PA-125-SCY", stock: 120, categoryId: "cat_feeding",
    isBestSeller: true,
    keyFeatures: ["125ml capacity — ideal for newborns", "Anti-colic valve integrated into nipple", "Soft, taste-free silicone nipple", "Ergonomic shape for comfortable grip", "BPA-free materials"],
    tags: ["bottle", "newborn", "philips", "anti-colic"],
  },
  {
    slug: "mumlove-glass-feeding-bottle",
    name: "Mumlove Glass Feeding Bottle",
    shortDescription: "Eco-friendly borosilicate glass bottle with silicone sleeve.",
    description: "The Mumlove Glass Feeding Bottle offers a premium, toxin-free feeding solution. Made from pharmaceutical-grade borosilicate glass, it resists thermal shock and never leaches chemicals. The protective silicone sleeve provides a non-slip grip and protects the bottle from minor drops.",
    priceBdt: 850, compareAtBdt: 980, costBdt: 540,
    sku: "ML-GLS-240", stock: 56, categoryId: "cat_feeding",
    keyFeatures: ["Borosilicate glass — thermal shock resistant", "Protective silicone sleeve for grip", "Slow-flow silicone nipple included", "Dishwasher and sterilizer safe", "Plastic-free, eco-friendly design"],
    tags: ["glass-bottle", "eco", "mumlove", "newborn"],
  },
  {
    slug: "applebear-wide-neck-pp-bottle",
    name: "Applebear Wide Neck PP Bottle",
    shortDescription: "Affordable 250ml wide-neck polypropylene bottle.",
    description: "The Applebear Wide Neck PP Bottle delivers reliable feeding at an accessible price point. Made from food-grade polypropylene, this 250ml bottle is lightweight, durable, and BPA-free. The wide-neck opening makes it easy to fill and clean.",
    priceBdt: 350, costBdt: 180,
    sku: "AB-WN-250-PP", stock: 240, categoryId: "cat_feeding",
    keyFeatures: ["Food-grade polypropylene body", "250ml capacity with wide-neck design", "Medium-flow silicone nipple", "BPA-free and affordable", "Easy to clean and sterilize"],
    tags: ["bottle", "pp", "wide-neck", "budget"],
  },
  {
    slug: "rovco-anti-colic-150ml-feeder",
    name: "Rovco Anti-Colic 150ml Feeder",
    shortDescription: "Compact 150ml anti-colic feeder with vented nipple.",
    description: "The Rovco Anti-Colic 150ml Feeder is engineered with a smart venting system that prevents air ingestion, helping reduce colic, gas, and spit-up. The 150ml capacity is perfect for growing babies 1–6 months old.",
    priceBdt: 480, compareAtBdt: 560, costBdt: 270,
    sku: "RVC-AC-150", stock: 165, categoryId: "cat_feeding",
    keyFeatures: ["Advanced anti-colic venting system", "150ml capacity — perfect for 1-6 months", "Soft silicone slow-flow nipple", "BPA-free and phthalate-free", "Ergonomic, easy-grip body"],
    tags: ["bottle", "anti-colic", "rovco", "newborn"],
  },

  // ---- Mom Care & Maternity (cat_mom) ----
  {
    slug: "intelligent-rh228-automatic-double-breast-pump",
    name: "Intelligent RH228 Automatic Double Breast Pump",
    shortDescription: "Hospital-grade double electric pump with 9 suction levels.",
    description: "The Intelligent RH228 Automatic Double Breast Pump is a powerful, hospital-grade pump that expresses milk from both breasts simultaneously — cutting pumping time in half. Featuring 9 adjustable suction levels, 4 expression modes, and a backlit touchscreen, it adapts to every mother's comfort. The closed-system design prevents milk backflow and ensures hygiene.",
    priceBdt: 4500, compareAtBdt: 5500, costBdt: 3000,
    sku: "RH228-DBL", stock: 32, categoryId: "cat_mom",
    isFeatured: true, isBestSeller: true,
    keyFeatures: ["Double-sided pumping — saves 50% time", "9 suction levels + 4 expression modes", "Closed system — prevents milk backflow", "Backlit touchscreen interface", "Rechargeable battery — 2 hour runtime"],
    tags: ["breast-pump", "electric", "double", "maternity"],
  },
  {
    slug: "only-baby-manual-breast-pump",
    name: "Only Baby Manual Breast Pump",
    shortDescription: "Lightweight manual pump with soft silicone horn.",
    description: "The Only Baby Manual Breast Pump is the perfect on-the-go solution for moms who prefer quiet, portable pumping. The soft silicone cushion stimulates letdown gently, while the ergonomic lever handle minimizes hand fatigue. BPA-free and dishwasher safe.",
    priceBdt: 850, compareAtBdt: 990, costBdt: 480,
    sku: "OB-MAN-BP", stock: 78, categoryId: "cat_mom",
    keyFeatures: ["Soft silicone horn for gentle letdown", "Ergonomic lever — minimal hand fatigue", "BPA-free, dishwasher safe", "Includes 150ml storage bottle", "Compact, travel-friendly design"],
    tags: ["breast-pump", "manual", "portable", "maternity"],
  },
  {
    slug: "baby-smile-washable-breast-pad-4pcs",
    name: "Baby Smile Washable Breast Pad (4 Pcs)",
    shortDescription: "Ultra-soft bamboo washable nursing pads — 4 piece pack.",
    description: "The Baby Smile Washable Breast Pad pack includes 4 ultra-soft nursing pads made from natural bamboo charcoal fiber. The 4-layer construction absorbs leaks quickly while the waterproof PUL backing prevents leaks from reaching clothing.",
    priceBdt: 450, costBdt: 220,
    sku: "BS-WBP-4", stock: 200, categoryId: "cat_mom",
    keyFeatures: ["Bamboo charcoal fiber — naturally antibacterial", "4-layer absorbent core with PUL backing", "Reusable and machine washable", "Breathable, prevents chafing", "Pack of 4 pads"],
    tags: ["breast-pad", "washable", "bamboo", "nursing"],
  },
  {
    slug: "momeasy-washable-breast-pad-6pcs",
    name: "Momeasy Washable Breast Pad (6 Pcs)",
    shortDescription: "Premium 6-piece pack of washable bamboo nursing pads.",
    description: "The Momeasy Washable Breast Pad 6-pack offers premium comfort for nursing mothers. Made with 5 layers of organic bamboo cotton, these pads wick moisture away from skin, keeping mom dry and comfortable. The waterproof backing protects clothing.",
    priceBdt: 620, compareAtBdt: 750, costBdt: 320,
    sku: "ME-WBP-6", stock: 180, categoryId: "cat_mom",
    keyFeatures: ["5-layer organic bamboo cotton", "Waterproof leak-proof backing", "Includes free mesh laundry pouch", "Pack of 6 pads", "Reusable, eco-friendly alternative to disposables"],
    tags: ["breast-pad", "washable", "momeasy", "nursing"],
  },
  {
    slug: "branded-multifunctional-crossbody-mommy-bag",
    name: "Branded Multifunctional Crossbody Mommy Bag",
    shortDescription: "Spacious crossbody diaper bag with insulated bottle pocket.",
    description: "The Branded Multifunctional Crossbody Mommy Bag is the ultimate companion for outings with baby. Crafted from water-resistant Oxford cloth, it features 8 organized compartments including an insulated bottle pocket, a wet-dry separation pouch, and a built-in baby changing mat.",
    priceBdt: 1850, compareAtBdt: 2200, costBdt: 1150,
    sku: "MM-CB-MULTI", stock: 45, categoryId: "cat_mom",
    isFeatured: true,
    keyFeatures: ["Water-resistant Oxford cloth exterior", "8 organized compartments", "Insulated bottle pocket", "Wet-dry separation pouch", "Includes foldable changing mat", "Adjustable crossbody strap"],
    tags: ["mommy-bag", "diaper-bag", "crossbody", "travel"],
  },

  // ---- Kids Kitchen & Dining (cat_kitchen) ----
  {
    slug: "portable-car-design-tiffin-box",
    name: "Portable Car Design Tiffin Box",
    shortDescription: "Adorable 3-compartment car-shaped tiffin with locking clips.",
    description: "The Portable Car Design Tiffin Box makes lunchtime fun! Shaped like a friendly cartoon car, this 3-compartment tiffin separates rice, curry, and snacks. Made from food-grade PP material with secure locking clips on all four sides to prevent spills.",
    priceBdt: 550, compareAtBdt: 680, costBdt: 290,
    sku: "KCH-CAR-TFN", stock: 95, categoryId: "cat_kitchen",
    isBestSeller: true,
    keyFeatures: ["Adorable car design kids love", "3 compartments keep food separate", "4-side secure locking clips", "Food-grade PP — BPA free", "Microwave safe (base only)"],
    tags: ["tiffin", "lunch-box", "kids", "car-design"],
  },
  {
    slug: "multifunctional-japanese-style-lunch-box",
    name: "Multifunctional Japanese-Style Lunch Box",
    shortDescription: "Stackable bento with chopsticks, sauce container, and strap.",
    description: "The Multifunctional Japanese-Style Lunch Box brings authentic bento culture to your child's day. This 2-tier stackable bento includes a removable divider, soy sauce fish container, matching chopsticks with case, and an elastic carrying strap.",
    priceBdt: 980, compareAtBdt: 1150, costBdt: 600,
    sku: "JP-BENTO-2T", stock: 62, categoryId: "cat_kitchen",
    keyFeatures: ["Authentic 2-tier bento design", "Includes chopsticks with case", "Soy sauce fish container included", "Airtight silicone seal", "Elastic carrying strap"],
    tags: ["lunch-box", "bento", "japanese", "stackable"],
  },
  {
    slug: "creative-kids-double-layer-stainless-steel-lunch-box",
    name: "Creative Kids Double Layer Stainless Steel Lunch Box",
    shortDescription: "Durable 304-grade stainless steel leak-proof lunch box.",
    description: "The Creative Kids Double Layer Stainless Steel Lunch Box is built to last for years. Made from premium 304 food-grade stainless steel, it won't absorb odors, stains, or flavors. The double-layer design separates rice from curry, and the silicone ring seal prevents leaks even when carried sideways.",
    priceBdt: 1250, compareAtBdt: 1500, costBdt: 780,
    sku: "SS-2L-DBL", stock: 48, categoryId: "cat_kitchen",
    isFeatured: true,
    keyFeatures: ["Premium 304 food-grade stainless steel", "Double-layer leak-proof design", "Silicone ring seal — carry sideways", "Rust-proof and odor-resistant", "Dishwasher safe"],
    tags: ["lunch-box", "stainless-steel", "double-layer", "durable"],
  },
  {
    slug: "creative-baby-bus-straw-water-cup",
    name: "Creative Baby Bus Straw Water Cup",
    shortDescription: "Cute bus-shaped 300ml kids water bottle with flip-up straw.",
    description: "The Creative Baby Bus Straw Water Cup turns hydration into playtime. Shaped like a friendly yellow school bus, it holds 300ml of water or juice. The flip-up silicone straw is gentle on little mouths and the leak-proof lid prevents spills in backpacks.",
    priceBdt: 420, costBdt: 200,
    sku: "BUS-STRW-300", stock: 130, categoryId: "cat_kitchen",
    keyFeatures: ["Cute school-bus design", "300ml capacity", "Flip-up soft silicone straw", "Leak-proof lid", "Foldable easy-grip handles"],
    tags: ["water-cup", "straw", "kids", "bus"],
  },
  {
    slug: "bamboo-fiber-kids-tableware-set",
    name: "Bamboo Fiber Kid's Tableware Set",
    shortDescription: "Eco-friendly 5-piece dining set from natural bamboo fiber.",
    description: "The Bamboo Fiber Kid's Tableware Set includes everything needed for independent meals: a divided plate, bowl, cup, fork, and spoon. Made from biodegradable bamboo fiber, this set is free from BPA, melamine, and phthalates.",
    priceBdt: 880, compareAtBdt: 1050, costBdt: 540,
    sku: "BFM-TW-5P", stock: 75, categoryId: "cat_kitchen",
    keyFeatures: ["5-piece set: plate, bowl, cup, fork, spoon", "Biodegradable bamboo fiber", "BPA, melamine, and phthalate free", "Shatter-proof durable design", "Eco-friendly and sustainable"],
    tags: ["tableware", "bamboo", "kids", "eco-friendly"],
  },

  // ---- Baby Clothing & Outfits (cat_clothing) ----
  {
    slug: "kids-summer-short-sleeve-knitted-set",
    name: "Kids Summer Short-Sleeve Knitted Set",
    shortDescription: "Breathable 2-piece cotton knit set for hot summers.",
    description: "The Kids Summer Short-Sleeve Knitted Set is engineered for Bangladesh's humid climate. Made from 100% combed cotton with a breathable knit weave, this 2-piece top-and-shorts set keeps little ones cool and comfortable.",
    priceBdt: 690, compareAtBdt: 850, costBdt: 380,
    sku: "CLTH-KNIT-SMR", stock: 110, categoryId: "cat_clothing",
    isBestSeller: true,
    keyFeatures: ["100% combed cotton knit", "Breathable weave for hot climates", "Elastic waistband for perfect fit", "2-piece set — top + shorts", "Machine washable"],
    tags: ["clothing", "summer", "knit", "cotton", "set"],
  },
  {
    slug: "imported-bubble-print-two-piece-outfit",
    name: "Imported Bubble Print Two-Piece Outfit",
    shortDescription: "Trendy bubble-print 2-piece outfit with matching cap.",
    description: "The Imported Bubble Print Two-Piece Outfit features a playful bubble pattern on premium cotton-blend fabric. This trendy set includes a top, shorts, and matching cap, making it a complete look for playdates and outings.",
    priceBdt: 980, compareAtBdt: 1200, costBdt: 600,
    sku: "CLTH-BUBL-2P", stock: 65, categoryId: "cat_clothing",
    keyFeatures: ["Playful bubble print design", "3-piece: top + shorts + cap", "Reinforced seams for active play", "Soft cotton-blend fabric", "Imported quality"],
    tags: ["clothing", "outfit", "bubble-print", "toddler"],
  },
  {
    slug: "strawberry-design-baby-girl-party-frock",
    name: "Strawberry Design Baby Girl Party Frock",
    shortDescription: "Adorable strawberry-embroidered party frock with tulle.",
    description: "The Strawberry Design Baby Girl Party Frock is the perfect dress for birthdays, weddings, and special occasions. Featuring hand-embroidered strawberries on the bodice, a layered tulle underskirt for volume, and a satin bow at the back.",
    priceBdt: 1450, compareAtBdt: 1750, costBdt: 880,
    sku: "CLTH-STRW-FRK", stock: 38, categoryId: "cat_clothing",
    isFeatured: true,
    keyFeatures: ["Hand-embroidered strawberry detail", "Layered tulle underskirt for volume", "Soft cotton lining", "Satin bow back closure", "Available for ages 1-5 years"],
    tags: ["clothing", "frock", "party", "girls", "strawberry"],
  },
  {
    slug: "sunflower-design-pure-cotton-frock",
    name: "Sunflower Design Pure Cotton Frock",
    shortDescription: "Cheerful sunflower-print 100% cotton frock for daily wear.",
    description: "The Sunflower Design Pure Cotton Frock brings sunshine to everyday outfits. Made from 100% pure cotton with a cheerful sunflower print, this knee-length frock is perfect for daily wear, family outings, and playtime.",
    priceBdt: 750, costBdt: 420,
    sku: "CLTH-SUN-FRK", stock: 88, categoryId: "cat_clothing",
    keyFeatures: ["100% pure cotton fabric", "Cheerful sunflower print", "Knee-length with ruffled hem", "Square neckline", "Button back closure"],
    tags: ["clothing", "frock", "cotton", "girls", "sunflower"],
  },
  {
    slug: "cute-daily-cotton-essentials-romper",
    name: "Cute Daily Cotton Essentials Romper",
    shortDescription: "Pack of 3 everyday cotton rompers with snap closure.",
    description: "The Cute Daily Cotton Essentials Romper pack includes 3 everyday rompers in coordinating pastel colors. Made from ultra-soft 100% cotton, these rompers are designed for daily comfort and easy diaper changes with 3-snap bottom closure.",
    priceBdt: 890, compareAtBdt: 1100, costBdt: 480,
    sku: "CLTH-RMP-3P", stock: 100, categoryId: "cat_clothing",
    isBestSeller: true,
    keyFeatures: ["Pack of 3 coordinating rompers", "Ultra-soft 100% cotton", "3-snap bottom for easy changes", "Envelope neckline", "Suitable for 0-12 months"],
    tags: ["clothing", "romper", "cotton", "newborn", "pack"],
  },

  // ---- Health, Safety & Grooming (cat_health) ----
  {
    slug: "childrens-premium-imported-hair-comb",
    name: "Children's Premium Imported Hair Comb",
    shortDescription: "Dual-side wooden baby comb — fine and wide teeth.",
    description: "The Children's Premium Imported Hair Comb features a dual-sided design with fine teeth on one side and wide teeth on the other, perfect for all hair types. Made from sustainably sourced beech wood with smooth rounded teeth that won't scratch baby's sensitive scalp.",
    priceBdt: 320, costBdt: 150,
    sku: "GRM-CMB-WD", stock: 220, categoryId: "cat_health",
    keyFeatures: ["Dual-side: fine + wide teeth", "Sustainably sourced beech wood", "Smooth rounded teeth — scalp-safe", "Compact travel size", "Suitable for all hair types"],
    tags: ["grooming", "comb", "wooden", "hair"],
  },
  {
    slug: "safe-baby-nasal-aspirator",
    name: "Safe Baby Nasal Aspirator",
    shortDescription: "Gentle manual nasal aspirator with soft silicone tip.",
    description: "The Safe Baby Nasal Aspirator provides gentle, effective relief from congested little noses. The soft silicone tip is gentle on baby's nostrils, while the parent-controlled suction ensures safe, comfortable clearing.",
    priceBdt: 380, compareAtBdt: 480, costBdt: 190,
    sku: "HLT-NASL-MAN", stock: 145, categoryId: "cat_health",
    keyFeatures: ["Soft silicone tip — gentle on nostrils", "Parent-controlled suction", "Includes 2 reusable filters", "Protective storage case", "BPA-free, sterilizer safe"],
    tags: ["health", "nasal-aspirator", "safety", "newborn"],
  },
  {
    slug: "kidlon-baby-bottle-cleanser-500ml",
    name: "Kidlon Baby Bottle Cleanser 500ml",
    shortDescription: "Plant-based bottle cleanser — no harsh chemicals.",
    description: "The Kidlon Baby Bottle Cleanser 500ml is specially formulated to break down milk proteins, fat, and oil residue from baby bottles, nipples, and breast pump parts. Made from plant-derived ingredients, it's free from phosphates, parabens, and artificial fragrances.",
    priceBdt: 480, compareAtBdt: 580, costBdt: 260,
    sku: "HLT-CLN-500", stock: 175, categoryId: "cat_health",
    isBestSeller: true,
    keyFeatures: ["Plant-based formula", "Removes milk proteins and fat", "Free from phosphates and parabens", "No artificial fragrances", "Rinse-clean — no soapy residue"],
    tags: ["cleanser", "bottle-cleaner", "plant-based", "safe"],
  },
  {
    slug: "baby-wet-wipes-sensitive-80-pack",
    name: "Baby Wet Wipes Sensitive (80 Pack)",
    shortDescription: "Ultra-soft sensitive wipes — 99% pure water.",
    description: "The Baby Wet Wipes Sensitive (80 Pack) are made with 99% purified water and aloe vera extract, making them safe for the most delicate newborn skin. Free from alcohol, parabens, and fragrances.",
    priceBdt: 220, costBdt: 110,
    sku: "HLT-WIP-80", stock: 380, categoryId: "cat_health",
    isBestSeller: true,
    keyFeatures: ["99% purified water formula", "Aloe vera extract for soothing", "Alcohol, paraben, fragrance free", "Thick, ultra-soft fabric", "Resealable sticker lid"],
    tags: ["wipes", "sensitive", "newborn", "alcohol-free"],
  },
  {
    slug: "electric-baby-nail-trimmer",
    name: "Electric Baby Nail Trimmer",
    shortDescription: "Whisper-quiet electric nail trimmer with 6 heads.",
    description: "The Electric Baby Nail Trimmer takes the fear out of trimming tiny nails. Whisper-quiet motor won't wake sleeping babies, and the gentle rotating action files nails smoothly without cutting skin. Includes 6 interchangeable heads and a built-in LED light.",
    priceBdt: 720, compareAtBdt: 900, costBdt: 410,
    sku: "HLT-NAIL-ELC", stock: 92, categoryId: "cat_health",
    isFeatured: true,
    keyFeatures: ["Whisper-quiet motor", "6 interchangeable filing heads", "Built-in LED light", "Gentle action — safe on skin", "Operates on 2 AA batteries"],
    tags: ["grooming", "nail-trimmer", "electric", "safety"],
  },
];

// Map mock-data slugs to real backend image paths
const API = "http://localhost:4000";
const IMG_MAP: Record<string, string> = {
  "mumlove-glass-feeding-bottle": `${API}/images/products/mumlove-glass-feeding-bottle.webp`,
  "applebear-wide-neck-pp-bottle": `${API}/images/products/applebear-wide-neck-pp-bottle.webp`,
  "philips-avent-natural-response-260ml": `${API}/images/products/philips-avent-260ml-bottle.webp`,
  "philips-avent-125ml-bottle": `${API}/images/products/philips-avent-125ml-bottle.webp`,
  "intelligent-rh228-automatic-double-breast-pump": `${API}/images/products/intelligent-rh228-double-breast-pump.webp`,
  "only-baby-manual-breast-pump": `${API}/images/products/only-baby-manual-breast-pump.webp`,
  "baby-smile-washable-breast-pad-4pcs": `${API}/images/products/baby-smile-washable-breast-pad.webp`,
  "momeasy-washable-breast-pad-6pcs": `${API}/images/products/momeasy-washable-breast-pad.webp`,
  "branded-multifunctional-crossbody-mommy-bag": `${API}/images/products/imported-multifunctional-mommy-bag.png`,
  "portable-car-design-tiffin-box": `${API}/images/products/portable-car-design-tiffin-box.png`,
  "multifunctional-japanese-style-lunch-box": `${API}/images/products/multifunctional-japanese-lunch-box.png`,
  "creative-kids-double-layer-stainless-steel-lunch-box": `${API}/images/products/creative-kids-stainless-lunch-box.jpg`,
  "creative-baby-bus-straw-water-cup": `${API}/images/products/creative-baby-bus-straw-water-cup.png`,
  "bamboo-fiber-kids-tableware-set": `${API}/images/products/bamboo-fiber-kids-tableware-set.png`,
  "kids-summer-short-sleeve-knitted-set": `${API}/images/products/kids-summer-short-sleeve-knitted-set.png`,
  "imported-bubble-print-two-piece-outfit": `${API}/images/products/imported-bubble-print-two-piece-outfit.png`,
  "strawberry-design-baby-girl-party-frock": `${API}/images/products/strawberry-design-baby-girl-party-frock.jpg`,
  "sunflower-design-pure-cotton-frock": `${API}/images/products/sunflower-design-pure-cotton-frock.jpg`,
  "childrens-premium-imported-hair-comb": `${API}/images/products/childrens-premium-imported-hair-comb.webp`,
  "safe-baby-nasal-aspirator": `${API}/images/products/safe-baby-nasal-aspirator.png`,
};

// Build full Product[] from seeds
export const PRODUCTS: Product[] = PRODUCT_SEEDS.map((p, idx) => {
  const category = CATEGORIES.find((c) => c.id === p.categoryId)!;
  const createdAt = daysAgo(20 - (idx % 20));
  const realImg = IMG_MAP[p.slug];
  return {
    id: `prod_${idx + 1}`,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    priceBdt: p.priceBdt,
    compareAtBdt: p.compareAtBdt ?? null,
    costBdt: p.costBdt ?? null,
    currency: "BDT",
    sku: p.sku,
    barcode: null,
    stock: p.stock,
    lowStockThreshold: 5,
    weightGrams: null,
    status: "ACTIVE" as const,
    visibility: "PUBLISHED" as const,
    isFeatured: p.isFeatured ?? false,
    isBestSeller: p.isBestSeller ?? false,
    ratingAverage: 4 + (idx % 10) / 10,
    ratingCount: 10 + (idx * 7) % 200,
    salesCount: (idx * 13) % 500,
    categoryId: p.categoryId,
    categorySlug: category.slug,
    categoryName: category.name,
    images: realImg
      ? [realImg]
      : [
          placeholderImage(p.name.slice(0, 20)),
          placeholderImage(`${p.name.slice(0, 15)} side`, 800, 800, "FECACA", "7C2D12"),
          placeholderImage(`${p.name.slice(0, 15)} pack`, 800, 800, "FEF3C7", "78350F"),
        ],
    keyFeatures: p.keyFeatures,
    tags: p.tags,
    attributes: {},
    createdAt,
    updatedAt: createdAt,
  };
});

// -----------------------------------------------------------------------------
// Sample orders for admin (8)
// -----------------------------------------------------------------------------

const SAMPLE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING", "PENDING", "PROCESSING", "PROCESSING",
  "SHIPPED", "COMPLETED", "COMPLETED", "CANCELLED",
];

const SAMPLE_CUSTOMERS = [
  { name: "Rahima Akter", phone: "01711-234567", address: "House 12, Road 5, Dhanmondi, Dhaka 1209", email: "rahima@example.com" },
  { name: "Karim Uddin", phone: "01812-345678", address: "Flat B3, Jasmine Tower, Gulshan 2, Dhaka 1212", email: "karim@example.com" },
  { name: "Nusrat Jahan", phone: "01911-456789", address: "Village: Madhabpur, P.O. Sonargaon, Narayanganj", email: null },
  { name: "Mohammed Saif", phone: "01611-567890", address: "27/B Khilgaon Chowdhury Para, Dhaka 1219", email: "saif@example.com" },
  { name: "Tania Sultana", phone: "01511-678901", address: "Mira Bazar, Sylhet 3100", email: null },
  { name: "Imran Hossain", phone: "01711-789012", address: "72 Kazir Dewri, Chittagong 4000", email: "imran@example.com" },
  { name: "Farzana Yesmin", phone: "01811-890123", address: "House 45, Block C, Banasree, Rampura, Dhaka 1219", email: null },
  { name: "Sabbir Ahmed", phone: "01911-901234", address: "Main Road, Pirojpur Sadar, Pirojpur", email: null },
];

function buildOrder(idx: number): Order {
  const status = SAMPLE_ORDER_STATUSES[idx];
  const customer = SAMPLE_CUSTOMERS[idx];
  const itemsCount = 1 + (idx % 3);
  const items = Array.from({ length: itemsCount }, (_, i) => {
    const product = PRODUCTS[(idx * 3 + i) % PRODUCTS.length];
    const quantity = 1 + (i % 2);
    return {
      id: `oi_${idx}_${i}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0],
      unitPriceBdt: product.priceBdt,
      quantity,
      lineTotalBdt: product.priceBdt * quantity,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.lineTotalBdt, 0);
  const shipping = customer.address.toLowerCase().includes("dhaka") ? 60 : 120;
  const total = subtotal + shipping;
  const createdAt = hoursAgo(idx * 7 + 2);
  return {
    id: `ord_${idx + 1}`,
    orderNumber: `BP-2025-${String(idx + 1).padStart(6, "0")}`,
    userId: idx % 3 === 0 ? `user_${idx + 1}` : null,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    shippingAddress: customer.address,
    note: idx % 4 === 0 ? "Please deliver after 5 PM" : null,
    status,
    paymentStatus: status === "COMPLETED" ? "PAID" : status === "CANCELLED" ? "UNPAID" : "PENDING",
    paymentMethod: idx % 2 === 0 ? "CASH_ON_DELIVERY" : "BKASH",
    subtotalBdt: subtotal,
    shippingCostBdt: shipping,
    discountBdt: 0,
    totalBdt: total,
    trackingNumber: status === "SHIPPED" || status === "COMPLETED" ? `TRK${1000 + idx}` : null,
    courierName: status === "SHIPPED" || status === "COMPLETED" ? "Steadfast" : null,
    shippedAt: status === "SHIPPED" || status === "COMPLETED" ? hoursAgo(idx * 5) : null,
    deliveredAt: status === "COMPLETED" ? hoursAgo(idx * 2) : null,
    cancelledAt: status === "CANCELLED" ? hoursAgo(idx * 1) : null,
    createdAt,
    updatedAt: createdAt,
    items,
  };
}

export const ORDERS: Order[] = Array.from({ length: 8 }, (_, i) => buildOrder(i));

// -----------------------------------------------------------------------------
// Sample users (5)
// -----------------------------------------------------------------------------

export const USERS: User[] = [
  { id: "user_1", email: "admin@babyplanet.bd", name: "Site Administrator", phone: "+8801711000001", avatarUrl: null, role: "ADMIN", status: "ACTIVE", createdAt: daysAgo(30) },
  { id: "user_2", email: "rahima@example.com", name: "Rahima Akter", phone: "01711-234567", avatarUrl: null, role: "USER", status: "ACTIVE", createdAt: daysAgo(28) },
  { id: "user_3", email: "karim@example.com", name: "Karim Uddin", phone: "01812-345678", avatarUrl: null, role: "USER", status: "ACTIVE", createdAt: daysAgo(25) },
  { id: "user_4", email: "saif@example.com", name: "Mohammed Saif", phone: "01611-567890", avatarUrl: null, role: "USER", status: "ACTIVE", createdAt: daysAgo(15) },
  { id: "user_5", email: "imran@example.com", name: "Imran Hossain", phone: "01711-789012", avatarUrl: null, role: "MANAGER", status: "ACTIVE", createdAt: daysAgo(10) },
];

// -----------------------------------------------------------------------------
// Query helpers (mimic TanStack Query hooks against an in-memory store)
// -----------------------------------------------------------------------------

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getBestSellers(): Product[] {
  return PRODUCTS.filter((p) => p.isBestSeller);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const product = getProductBySlug(slug);
  if (!product) return [];
  return PRODUCTS.filter((p) => p.categoryId === product.categoryId && p.slug !== slug).slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription?.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

export function getOrderStats() {
  return {
    total: ORDERS.length,
    pending: ORDERS.filter((o) => o.status === "PENDING").length,
    processing: ORDERS.filter((o) => o.status === "PROCESSING").length,
    shipped: ORDERS.filter((o) => o.status === "SHIPPED").length,
    completed: ORDERS.filter((o) => o.status === "COMPLETED").length,
    cancelled: ORDERS.filter((o) => o.status === "CANCELLED").length,
    totalRevenueBdt: ORDERS.filter((o) => o.status === "COMPLETED" || o.status === "SHIPPED").reduce((s, o) => s + o.totalBdt, 0),
    totalOrdersToday: ORDERS.filter((o) => Date.now() - new Date(o.createdAt).getTime() < 24 * 60 * 60 * 1000).length,
    averageOrderValueBdt: Math.round(ORDERS.reduce((s, o) => s + o.totalBdt, 0) / ORDERS.length),
    totalProducts: PRODUCTS.length,
    totalCategories: CATEGORIES.length,
    lowStockProducts: PRODUCTS.filter((p) => p.stock <= p.lowStockThreshold).length,
    totalUsers: USERS.length,
  };
}
