// =============================================================================
// Baby Planet BD Clone — Database Seeder
// -----------------------------------------------------------------------------
// Seeds exactly:
//   • 5 categories
//   • 5 products per category (25 total) — mimicking babyplanet-bd.com
//   • 1 admin user (admin@babyplanet.bd / Admin#1234)
//   • 2 sample customers
//
// Pricing model: stored as integer paisa (1 BDT = 100 paisa).
//   e.g. ৳950  → 95000 paisa
//        ৳350  → 35000 paisa
//        ৳1250 → 125000 paisa
//
// Usage:
//   bun run prisma:seed         (via tsx)
//   or: npx prisma db seed
// =============================================================================

import { PrismaClient, Prisma, ProductStatus, ProductVisibility, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

// -----------------------------------------------------------------------------
// Type definitions for seed data
// -----------------------------------------------------------------------------
type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  iconUrl: string;
  sortOrder: number;
  products: SeedProduct[];
};

type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceBdt: number; // in BDT (will be converted to paisa)
  compareAtBdt?: number;
  costBdt?: number;
  sku: string;
  barcode?: string;
  stock: number;
  weightGrams?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  keyFeatures: string[];
  tags: string[];
  images: string[];
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Convert BDT (taka) to integer paisa for storage. */
const bdtToPaisa = (bdt: number): bigint => BigInt(Math.round(bdt * 100));

/** Build a deterministic placeholder image URL for a given product name. */
const placeholderImage = (text: string, w = 800, h = 800): string =>
  `https://placehold.co/${w}x${h}/FDE68A/7C2D12?text=${encodeURIComponent(text)}`;

// -----------------------------------------------------------------------------
// SEED DATA — 5 categories × 5 products = 25 products
// -----------------------------------------------------------------------------

const SEED_DATA: SeedCategory[] = [
  // ===========================================================================
  // CATEGORY 1: Feeding & Drinking Essentials
  // ===========================================================================
  {
    slug: "feeding-drinking-essentials",
    name: "Feeding & Drinking Essentials",
    description:
      "Premium baby feeding bottles, sippers, and drinking accessories from trusted global brands like Philips Avent, Mumlove, Applebear, and Rovco. BPA-free, anti-colic, and pediatrician-recommended.",
    imageUrl: placeholderImage("Feeding & Drinking", 1200, 800),
    iconUrl: placeholderImage("🍼", 200, 200),
    sortOrder: 1,
    products: [
      {
        slug: "philips-avent-natural-response-260ml",
        name: "Philips Avent Natural Response 260ml Bottle",
        shortDescription:
          "Anti-colic wide-neck bottle with Natural Response nipple that lets baby control milk flow.",
        description:
          "The Philips Avent Natural Response 260ml feeding bottle is designed to mimic the natural breastfeeding experience. Its Natural Response nipple only releases milk when baby actively drinks, reducing spit-up and overeating. The wide-neck design makes cleaning effortless, and the AirFree vent keeps air out of baby's tummy to reduce colic. BPA-free and dishwasher safe.",
        priceBdt: 1250,
        compareAtBdt: 1500,
        costBdt: 820,
        sku: "PA-NR-260",
        barcode: "8710103901234",
        stock: 84,
        weightGrams: 180,
        isFeatured: true,
        isBestSeller: true,
        keyFeatures: [
          "Natural Response nipple — baby controls the flow",
          "Anti-colic AirFree vent integrated",
          "BPA-free polypropylene body",
          "Wide-neck design for easy cleaning",
          "Compatible with all Philips Avent Natural nipples",
        ],
        tags: ["bottle", "anti-colic", "philips", "avent", "newborn"],
        images: [
          placeholderImage("Philips Avent 260ml"),
          placeholderImage("Avent Natural Nipple", 800, 800),
          placeholderImage("Avent Bottle Pack", 800, 800),
        ],
      },
      {
        slug: "philips-avent-125ml-bottle",
        name: "Philips Avent 125ml Bottle",
        shortDescription:
          "Compact 125ml bottle ideal for newborns and small feeds with anti-colic system.",
        description:
          "The Philips Avent 125ml feeding bottle is the perfect size for newborns and small feeds. Featuring the proven Avent anti-colic system integrated into the nipple, it reduces colic and discomfort. The soft silicone nipple feels natural to baby and the ergonomic shape is easy for parents to hold during feeds.",
        priceBdt: 950,
        compareAtBdt: 1100,
        costBdt: 620,
        sku: "PA-125-SCY",
        barcode: "8710103905678",
        stock: 120,
        weightGrams: 140,
        isBestSeller: true,
        keyFeatures: [
          "125ml capacity — ideal for newborns",
          "Anti-colic valve integrated into nipple",
          "Soft, taste-free silicone nipple",
          "Ergonomic shape for comfortable grip",
          "BPA-free materials",
        ],
        tags: ["bottle", "newborn", "philips", "anti-colic"],
        images: [
          placeholderImage("Philips Avent 125ml"),
          placeholderImage("Avent Newborn Bottle", 800, 800),
        ],
      },
      {
        slug: "mumlove-glass-feeding-bottle",
        name: "Mumlove Glass Feeding Bottle",
        shortDescription:
          "Eco-friendly borosilicate glass bottle with silicone sleeve for safe grip.",
        description:
          "The Mumlove Glass Feeding Bottle offers a premium, toxin-free feeding solution. Made from pharmaceutical-grade borosilicate glass, it resists thermal shock and never leaches chemicals. The protective silicone sleeve provides a non-slip grip and protects the bottle from minor drops. Comes with a slow-flow silicone nipple suitable for newborns.",
        priceBdt: 850,
        compareAtBdt: 980,
        costBdt: 540,
        sku: "ML-GLS-240",
        barcode: "8945671201234",
        stock: 56,
        weightGrams: 260,
        keyFeatures: [
          "Borosilicate glass — thermal shock resistant",
          "Protective silicone sleeve for grip",
          "Slow-flow silicone nipple included",
          "Dishwasher and sterilizer safe",
          "Plastic-free, eco-friendly design",
        ],
        tags: ["glass-bottle", "eco", "mumlove", "newborn"],
        images: [
          placeholderImage("Mumlove Glass"),
          placeholderImage("Glass Bottle Sleeve", 800, 800),
        ],
      },
      {
        slug: "applebear-wide-neck-pp-bottle",
        name: "Applebear Wide Neck PP Bottle",
        shortDescription:
          "Affordable 250ml wide-neck polypropylene bottle for daily feeding.",
        description:
          "The Applebear Wide Neck PP Bottle delivers reliable feeding at an accessible price point. Made from food-grade polypropylene, this 250ml bottle is lightweight, durable, and BPA-free. The wide-neck opening makes it easy to fill and clean, while the medium-flow silicone nipple suits babies 3 months and older.",
        priceBdt: 350,
        costBdt: 180,
        sku: "AB-WN-250-PP",
        barcode: "8945671205678",
        stock: 240,
        weightGrams: 110,
        keyFeatures: [
          "Food-grade polypropylene body",
          "250ml capacity with wide-neck design",
          "Medium-flow silicone nipple",
          "BPA-free and affordable",
          "Easy to clean and sterilize",
        ],
        tags: ["bottle", "pp", "wide-neck", "budget"],
        images: [
          placeholderImage("Applebear Wide Neck"),
          placeholderImage("Applebear PP", 800, 800),
        ],
      },
      {
        slug: "rovco-anti-colic-150ml-feeder",
        name: "Rovco Anti-Colic 150ml Feeder",
        shortDescription:
          "Compact 150ml anti-colic feeder with vented nipple for reduced gas.",
        description:
          "The Rovco Anti-Colic 150ml Feeder is engineered with a smart venting system that prevents air ingestion, helping reduce colic, gas, and spit-up. The 150ml capacity is perfect for growing babies 1–6 months old. Comes with a soft silicone nipple and ergonomic body that's easy for parents to handle.",
        priceBdt: 480,
        compareAtBdt: 560,
        costBdt: 270,
        sku: "RVC-AC-150",
        barcode: "8945671209012",
        stock: 165,
        weightGrams: 130,
        keyFeatures: [
          "Advanced anti-colic venting system",
          "150ml capacity — perfect for 1-6 months",
          "Soft silicone slow-flow nipple",
          "BPA-free and phthalate-free",
          "Ergonomic, easy-grip body",
        ],
        tags: ["bottle", "anti-colic", "rovco", "newborn"],
        images: [
          placeholderImage("Rovco Anti-Colic"),
          placeholderImage("Rovco 150ml", 800, 800),
        ],
      },
    ],
  },

  // ===========================================================================
  // CATEGORY 2: Mom Care & Maternity
  // ===========================================================================
  {
    slug: "mom-care-maternity",
    name: "Mom Care & Maternity",
    description:
      "Everything a new or expecting mother needs: breast pumps, washable nursing pads, mommy bags, and postpartum essentials — handpicked for comfort, dignity, and convenience.",
    imageUrl: placeholderImage("Mom Care & Maternity", 1200, 800),
    iconUrl: placeholderImage("🤱", 200, 200),
    sortOrder: 2,
    products: [
      {
        slug: "intelligent-rh228-automatic-double-breast-pump",
        name: "Intelligent RH228 Automatic Double Breast Pump",
        shortDescription:
          "Hospital-grade double electric breast pump with 9 suction levels and touchscreen.",
        description:
          "The Intelligent RH228 Automatic Double Breast Pump is a powerful, hospital-grade pump that expresses milk from both breasts simultaneously — cutting pumping time in half. Featuring 9 adjustable suction levels, 4 expression modes, and a backlit touchscreen, it adapts to every mother's comfort. The closed-system design prevents milk backflow and ensures hygiene. Rechargeable battery provides up to 2 hours of cordless use.",
        priceBdt: 4500,
        compareAtBdt: 5500,
        costBdt: 3000,
        sku: "RH228-DBL",
        barcode: "6938900123456",
        stock: 32,
        weightGrams: 850,
        isFeatured: true,
        isBestSeller: true,
        keyFeatures: [
          "Double-sided pumping — saves 50% time",
          "9 suction levels + 4 expression modes",
          "Closed system — prevents milk backflow",
          "Backlit touchscreen interface",
          "Rechargeable battery — 2 hour runtime",
        ],
        tags: ["breast-pump", "electric", "double", "maternity"],
        images: [
          placeholderImage("RH228 Breast Pump"),
          placeholderImage("Double Pump Kit", 800, 800),
          placeholderImage("RH228 Touchscreen", 800, 800),
        ],
      },
      {
        slug: "only-baby-manual-breast-pump",
        name: "Only Baby Manual Breast Pump",
        shortDescription:
          "Lightweight manual pump with soft silicone horn and ergonomic handle.",
        description:
          "The Only Baby Manual Breast Pump is the perfect on-the-go solution for moms who prefer quiet, portable pumping. The soft silicone cushion stimulates letdown gently, while the ergonomic lever handle minimizes hand fatigue. BPA-free and dishwasher safe — disassembles in seconds for thorough cleaning. Includes a 150ml storage bottle with sealing disc.",
        priceBdt: 850,
        compareAtBdt: 990,
        costBdt: 480,
        sku: "OB-MAN-BP",
        barcode: "6938900127890",
        stock: 78,
        weightGrams: 320,
        keyFeatures: [
          "Soft silicone horn for gentle letdown",
          "Ergonomic lever — minimal hand fatigue",
          "BPA-free, dishwasher safe",
          "Includes 150ml storage bottle",
          "Compact, travel-friendly design",
        ],
        tags: ["breast-pump", "manual", "portable", "maternity"],
        images: [
          placeholderImage("Only Baby Manual Pump"),
          placeholderImage("Manual Pump Kit", 800, 800),
        ],
      },
      {
        slug: "baby-smile-washable-breast-pad-4pcs",
        name: "Baby Smile Washable Breast Pad (4 Pcs)",
        shortDescription:
          "Ultra-soft bamboo washable nursing pads — 4 piece pack with leak-proof backing.",
        description:
          "The Baby Smile Washable Breast Pad pack includes 4 ultra-soft nursing pads made from natural bamboo charcoal fiber. The 4-layer construction absorbs leaks quickly while the waterproof PUL backing prevents leaks from reaching clothing. Breathable and reusable — wash in warm water and air dry. One size fits most nursing mothers.",
        priceBdt: 450,
        costBdt: 220,
        sku: "BS-WBP-4",
        barcode: "6938900128906",
        stock: 200,
        weightGrams: 90,
        keyFeatures: [
          "Bamboo charcoal fiber — naturally antibacterial",
          "4-layer absorbent core with PUL backing",
          "Reusable and machine washable",
          "Breathable, prevents chafing",
          "Pack of 4 pads",
        ],
        tags: ["breast-pad", "washable", "bamboo", "nursing"],
        images: [
          placeholderImage("Baby Smile Pads"),
          placeholderImage("Washable Pads Pack", 800, 800),
        ],
      },
      {
        slug: "momeasy-washable-breast-pad-6pcs",
        name: "Momeasy Washable Breast Pad (6 Pcs)",
        shortDescription:
          "Premium 6-piece pack of washable bamboo nursing pads with carrying pouch.",
        description:
          "The Momeasy Washable Breast Pad 6-pack offers premium comfort for nursing mothers. Made with 5 layers of organic bamboo cotton, these pads wick moisture away from skin, keeping mom dry and comfortable. The waterproof backing protects clothing. Includes a free mesh laundry pouch for easy washing. One size fits most.",
        priceBdt: 620,
        compareAtBdt: 750,
        costBdt: 320,
        sku: "ME-WBP-6",
        barcode: "6938900129019",
        stock: 180,
        weightGrams: 130,
        keyFeatures: [
          "5-layer organic bamboo cotton",
          "Waterproof leak-proof backing",
          "Includes free mesh laundry pouch",
          "Pack of 6 pads",
          "Reusable, eco-friendly alternative to disposables",
        ],
        tags: ["breast-pad", "washable", "momeasy", "nursing"],
        images: [
          placeholderImage("Momeasy 6 Pads"),
          placeholderImage("Momeasy Pads Pack", 800, 800),
        ],
      },
      {
        slug: "branded-multifunctional-crossbody-mommy-bag",
        name: "Branded Multifunctional Crossbody Mommy Bag",
        shortDescription:
          "Spacious crossbody diaper bag with insulated bottle pocket and changing mat.",
        description:
          "The Branded Multifunctional Crossbody Mommy Bag is the ultimate companion for outings with baby. Crafted from water-resistant Oxford cloth, it features 8 organized compartments including an insulated bottle pocket, a wet-dry separation pouch, and a built-in baby changing mat. The adjustable crossbody strap keeps hands free, and the elegant unisex design suits both parents.",
        priceBdt: 1850,
        compareAtBdt: 2200,
        costBdt: 1150,
        sku: "MM-CB-MULTI",
        barcode: "6938900130121",
        stock: 45,
        weightGrams: 680,
        isFeatured: true,
        keyFeatures: [
          "Water-resistant Oxford cloth exterior",
          "8 organized compartments",
          "Insulated bottle pocket",
          "Wet-dry separation pouch",
          "Includes foldable changing mat",
          "Adjustable crossbody strap",
        ],
        tags: ["mommy-bag", "diaper-bag", "crossbody", "travel"],
        images: [
          placeholderImage("Mommy Bag Crossbody"),
          placeholderImage("Bag Compartments", 800, 800),
          placeholderImage("Bag Changing Mat", 800, 800),
        ],
      },
    ],
  },

  // ===========================================================================
  // CATEGORY 3: Kids Kitchen & Dining
  // ===========================================================================
  {
    slug: "kids-kitchen-dining",
    name: "Kids Kitchen & Dining",
    description:
      "Fun, safe, and durable dining solutions for little ones — tiffin boxes, lunch boxes, straw cups, and tableware designed for tiny hands and growing appetites.",
    imageUrl: placeholderImage("Kids Kitchen & Dining", 1200, 800),
    iconUrl: placeholderImage("🍱", 200, 200),
    sortOrder: 3,
    products: [
      {
        slug: "portable-car-design-tiffin-box",
        name: "Portable Car Design Tiffin Box",
        shortDescription:
          "Adorable 3-compartment car-shaped tiffin with secure locking clips.",
        description:
          "The Portable Car Design Tiffin Box makes lunchtime fun! Shaped like a friendly cartoon car, this 3-compartment tiffin separates rice, curry, and snacks. Made from food-grade PP material with secure locking clips on all four sides to prevent spills. Microwave safe (without lid) and dishwasher safe. Perfect for school-aged children.",
        priceBdt: 550,
        compareAtBdt: 680,
        costBdt: 290,
        sku: "KCH-CAR-TFN",
        barcode: "8945671234567",
        stock: 95,
        weightGrams: 280,
        isBestSeller: true,
        keyFeatures: [
          "Adorable car design kids love",
          "3 compartments keep food separate",
          "4-side secure locking clips",
          "Food-grade PP — BPA free",
          "Microwave safe (base only)",
        ],
        tags: ["tiffin", "lunch-box", "kids", "car-design"],
        images: [
          placeholderImage("Car Tiffin Box"),
          placeholderImage("Car Tiffin Open", 800, 800),
        ],
      },
      {
        slug: "multifunctional-japanese-style-lunch-box",
        name: "Multifunctional Japanese-Style Lunch Box",
        shortDescription:
          "Stackable bento-style lunch box with chopsticks, sauce container, and strap.",
        description:
          "The Multifunctional Japanese-Style Lunch Box brings authentic bento culture to your child's day. This 2-tier stackable bento includes a removable divider, soy sauce fish container, matching chopsticks with case, and an elastic carrying strap. The airtight silicone seal keeps food fresh for hours. Made from BPA-free materials. Microwave and dishwasher safe.",
        priceBdt: 980,
        compareAtBdt: 1150,
        costBdt: 600,
        sku: "JP-BENTO-2T",
        barcode: "8945671235678",
        stock: 62,
        weightGrams: 380,
        keyFeatures: [
          "Authentic 2-tier bento design",
          "Includes chopsticks with case",
          "Soy sauce fish container included",
          "Airtight silicone seal",
          "Elastic carrying strap",
        ],
        tags: ["lunch-box", "bento", "japanese", "stackable"],
        images: [
          placeholderImage("Japanese Bento Box"),
          placeholderImage("Bento Open View", 800, 800),
        ],
      },
      {
        slug: "creative-kids-double-layer-stainless-steel-lunch-box",
        name: "Creative Kids Double Layer Stainless Steel Lunch Box",
        shortDescription:
          "Durable 304-grade stainless steel double-layer lunch box with leakproof seal.",
        description:
          "The Creative Kids Double Layer Stainless Steel Lunch Box is built to last for years. Made from premium 304 food-grade stainless steel, it won't absorb odors, stains, or flavors. The double-layer design separates rice from curry, and the silicone ring seal prevents leaks even when carried sideways. Dishwasher safe and rust-proof.",
        priceBdt: 1250,
        compareAtBdt: 1500,
        costBdt: 780,
        sku: "SS-2L-DBL",
        barcode: "8945671236789",
        stock: 48,
        weightGrams: 460,
        isFeatured: true,
        keyFeatures: [
          "Premium 304 food-grade stainless steel",
          "Double-layer leak-proof design",
          "Silicone ring seal — carry sideways",
          "Rust-proof and odor-resistant",
          "Dishwasher safe",
        ],
        tags: ["lunch-box", "stainless-steel", "double-layer", "durable"],
        images: [
          placeholderImage("Stainless Lunch Box"),
          placeholderImage("Steel Box Open", 800, 800),
        ],
      },
      {
        slug: "creative-baby-bus-straw-water-cup",
        name: "Creative Baby Bus Straw Water Cup",
        shortDescription:
          "Cute bus-shaped 300ml kids water bottle with flip-up silicone straw.",
        description:
          "The Creative Baby Bus Straw Water Cup turns hydration into playtime. Shaped like a friendly yellow school bus, it holds 300ml of water or juice. The flip-up silicone straw is gentle on little mouths and the leak-proof lid prevents spills in backpacks. Easy-grip handles fold down for compact carrying. BPA-free and dishwasher safe.",
        priceBdt: 420,
        costBdt: 200,
        sku: "BUS-STRW-300",
        barcode: "8945671237890",
        stock: 130,
        weightGrams: 180,
        keyFeatures: [
          "Cute school-bus design",
          "300ml capacity",
          "Flip-up soft silicone straw",
          "Leak-proof lid",
          "Foldable easy-grip handles",
        ],
        tags: ["water-cup", "straw", "kids", "bus"],
        images: [
          placeholderImage("Bus Straw Cup"),
          placeholderImage("Bus Cup Detail", 800, 800),
        ],
      },
      {
        slug: "bamboo-fiber-kids-tableware-set",
        name: "Bamboo Fiber Kid's Tableware Set",
        shortDescription:
          "Eco-friendly 5-piece dining set made from natural bamboo fiber.",
        description:
          "The Bamboo Fiber Kid's Tableware Set includes everything needed for independent meals: a divided plate, bowl, cup, fork, and spoon. Made from biodegradable bamboo fiber, this set is free from BPA, melamine, and phthalates. The bright, gender-neutral design makes meals fun, and the durable material won't shatter when dropped. Hand wash recommended for longevity.",
        priceBdt: 880,
        compareAtBdt: 1050,
        costBdt: 540,
        sku: "BFM-TW-5P",
        barcode: "8945671238901",
        stock: 75,
        weightGrams: 520,
        keyFeatures: [
          "5-piece set: plate, bowl, cup, fork, spoon",
          "Biodegradable bamboo fiber",
          "BPA, melamine, and phthalate free",
          "Shatter-proof durable design",
          "Eco-friendly and sustainable",
        ],
        tags: ["tableware", "bamboo", "kids", "eco-friendly"],
        images: [
          placeholderImage("Bamboo Tableware Set"),
          placeholderImage("Bamboo Set Detail", 800, 800),
        ],
      },
    ],
  },

  // ===========================================================================
  // CATEGORY 4: Baby Clothing & Outfits
  // ===========================================================================
  {
    slug: "baby-clothing-outfits",
    name: "Baby Clothing & Outfits",
    description:
      "Soft, breathable, skin-friendly clothing for every occasion — from daily cotton rompers to party frocks. Each piece is gentle on baby's delicate skin and built to survive countless wash cycles.",
    imageUrl: placeholderImage("Baby Clothing & Outfits", 1200, 800),
    iconUrl: placeholderImage("👶", 200, 200),
    sortOrder: 4,
    products: [
      {
        slug: "kids-summer-short-sleeve-knitted-set",
        name: "Kids Summer Short-Sleeve Knitted Set",
        shortDescription:
          "Breathable 2-piece cotton knit set — perfect for hot Bangladesh summers.",
        description:
          "The Kids Summer Short-Sleeve Knitted Set is engineered for Bangladesh's humid climate. Made from 100% combed cotton with a breathable knit weave, this 2-piece top-and-shorts set keeps little ones cool and comfortable. The elastic waistband ensures a perfect fit, and the soft pastel color palette suits both boys and girls.",
        priceBdt: 690,
        compareAtBdt: 850,
        costBdt: 380,
        sku: "CLTH-KNIT-SMR",
        barcode: "8945671245678",
        stock: 110,
        weightGrams: 220,
        isBestSeller: true,
        keyFeatures: [
          "100% combed cotton knit",
          "Breathable weave for hot climates",
          "Elastic waistband for perfect fit",
          "2-piece set — top + shorts",
          "Machine washable",
        ],
        tags: ["clothing", "summer", "knit", "cotton", "set"],
        images: [
          placeholderImage("Summer Knit Set"),
          placeholderImage("Knit Set Detail", 800, 800),
        ],
      },
      {
        slug: "imported-bubble-print-two-piece-outfit",
        name: "Imported Bubble Print Two-Piece Outfit",
        shortDescription:
          "Trendy bubble-print 2-piece outfit with matching cap — imported quality.",
        description:
          "The Imported Bubble Print Two-Piece Outfit features a playful bubble pattern on premium cotton-blend fabric. This trendy set includes a top, shorts, and matching cap, making it a complete look for playdates and outings. Imported quality with reinforced seams for active toddlers. Available in multiple colorways.",
        priceBdt: 980,
        compareAtBdt: 1200,
        costBdt: 600,
        sku: "CLTH-BUBL-2P",
        barcode: "8945671246789",
        stock: 65,
        weightGrams: 280,
        keyFeatures: [
          "Playful bubble print design",
          "3-piece: top + shorts + cap",
          "Reinforced seams for active play",
          "Soft cotton-blend fabric",
          "Imported quality",
        ],
        tags: ["clothing", "outfit", "bubble-print", "toddler"],
        images: [
          placeholderImage("Bubble Print Outfit"),
          placeholderImage("Bubble Outfit Set", 800, 800),
        ],
      },
      {
        slug: "strawberry-design-baby-girl-party-frock",
        name: "Strawberry Design Baby Girl Party Frock",
        shortDescription:
          "Adorable strawberry-embroidered party frock with tulle underskirt.",
        description:
          "The Strawberry Design Baby Girl Party Frock is the perfect dress for birthdays, weddings, and special occasions. Featuring hand-embroidered strawberries on the bodice, a layered tulle underskirt for volume, and a satin bow at the back. The cotton lining keeps baby comfortable all day. Available for ages 1-5 years.",
        priceBdt: 1450,
        compareAtBdt: 1750,
        costBdt: 880,
        sku: "CLTH-STRW-FRK",
        barcode: "8945671247890",
        stock: 38,
        weightGrams: 320,
        isFeatured: true,
        keyFeatures: [
          "Hand-embroidered strawberry detail",
          "Layered tulle underskirt for volume",
          "Soft cotton lining",
          "Satin bow back closure",
          "Available for ages 1-5 years",
        ],
        tags: ["clothing", "frock", "party", "girls", "strawberry"],
        images: [
          placeholderImage("Strawberry Frock"),
          placeholderImage("Frock Detail", 800, 800),
        ],
      },
      {
        slug: "sunflower-design-pure-cotton-frock",
        name: "Sunflower Design Pure Cotton Frock",
        shortDescription:
          "Cheerful sunflower-print 100% cotton frock for daily wear.",
        description:
          "The Sunflower Design Pure Cotton Frock brings sunshine to everyday outfits. Made from 100% pure cotton with a cheerful sunflower print, this knee-length frock is perfect for daily wear, family outings, and playtime. Features a square neckline, button back closure, and ruffled hem. Gentle on sensitive skin.",
        priceBdt: 750,
        costBdt: 420,
        sku: "CLTH-SUN-FRK",
        barcode: "8945671248901",
        stock: 88,
        weightGrams: 240,
        keyFeatures: [
          "100% pure cotton fabric",
          "Cheerful sunflower print",
          "Knee-length with ruffled hem",
          "Square neckline",
          "Button back closure",
        ],
        tags: ["clothing", "frock", "cotton", "girls", "sunflower"],
        images: [
          placeholderImage("Sunflower Frock"),
          placeholderImage("Sunflower Detail", 800, 800),
        ],
      },
      {
        slug: "cute-daily-cotton-essentials-romper",
        name: "Cute Daily Cotton Essentials Romper",
        shortDescription:
          "Pack of 3 everyday cotton rompers with snap closure for easy changes.",
        description:
          "The Cute Daily Cotton Essentials Romper pack includes 3 everyday rompers in coordinating pastel colors. Made from ultra-soft 100% cotton, these rompers are designed for daily comfort and easy diaper changes with 3-snap bottom closure. The envelope neckline slides easily over baby's head. Perfect for newborns 0-12 months.",
        priceBdt: 890,
        compareAtBdt: 1100,
        costBdt: 480,
        sku: "CLTH-RMP-3P",
        barcode: "8945671249012",
        stock: 100,
        weightGrams: 360,
        isBestSeller: true,
        keyFeatures: [
          "Pack of 3 coordinating rompers",
          "Ultra-soft 100% cotton",
          "3-snap bottom for easy changes",
          "Envelope neckline",
          "Suitable for 0-12 months",
        ],
        tags: ["clothing", "romper", "cotton", "newborn", "pack"],
        images: [
          placeholderImage("Cotton Romper Pack"),
          placeholderImage("Romper Detail", 800, 800),
        ],
      },
    ],
  },

  // ===========================================================================
  // CATEGORY 5: Health, Safety & Grooming
  // ===========================================================================
  {
    slug: "health-safety-grooming",
    name: "Health, Safety & Grooming",
    description:
      "Keep your little one safe, healthy, and well-groomed with our curated range of nasal aspirators, nail trimmers, bottle cleansers, wet wipes, and grooming kits — all rigorously tested for baby safety.",
    imageUrl: placeholderImage("Health, Safety & Grooming", 1200, 800),
    iconUrl: placeholderImage("🩺", 200, 200),
    sortOrder: 5,
    products: [
      {
        slug: "childrens-premium-imported-hair-comb",
        name: "Children's Premium Imported Hair Comb",
        shortDescription:
          "Dual-side wooden baby comb with fine and wide teeth for tangle-free grooming.",
        description:
          "The Children's Premium Imported Hair Comb features a dual-sided design with fine teeth on one side and wide teeth on the other, perfect for all hair types. Made from sustainably sourced beech wood with smooth rounded teeth that won't scratch baby's sensitive scalp. Compact size fits in any diaper bag.",
        priceBdt: 320,
        costBdt: 150,
        sku: "GRM-CMB-WD",
        barcode: "8945671256789",
        stock: 220,
        weightGrams: 60,
        keyFeatures: [
          "Dual-side: fine + wide teeth",
          "Sustainably sourced beech wood",
          "Smooth rounded teeth — scalp-safe",
          "Compact travel size",
          "Suitable for all hair types",
        ],
        tags: ["grooming", "comb", "wooden", "hair"],
        images: [
          placeholderImage("Kids Hair Comb"),
          placeholderImage("Comb Detail", 800, 800),
        ],
      },
      {
        slug: "safe-baby-nasal-aspirator",
        name: "Safe Baby Nasal Aspirator",
        shortDescription:
          "Gentle manual nasal aspirator with soft silicone tip and reusable filter.",
        description:
          "The Safe Baby Nasal Aspirator provides gentle, effective relief from congested little noses. The soft silicone tip is gentle on baby's nostrils, while the parent-controlled suction ensures safe, comfortable clearing. Includes 2 reusable washable filters and a protective storage case. BPA-free and sterilizer safe.",
        priceBdt: 380,
        compareAtBdt: 480,
        costBdt: 190,
        sku: "HLT-NASL-MAN",
        barcode: "8945671257890",
        stock: 145,
        weightGrams: 90,
        keyFeatures: [
          "Soft silicone tip — gentle on nostrils",
          "Parent-controlled suction",
          "Includes 2 reusable filters",
          "Protective storage case",
          "BPA-free, sterilizer safe",
        ],
        tags: ["health", "nasal-aspirator", "safety", "newborn"],
        images: [
          placeholderImage("Nasal Aspirator"),
          placeholderImage("Aspirator Kit", 800, 800),
        ],
      },
      {
        slug: "kidlon-baby-bottle-cleanser-500ml",
        name: "Kidlon Baby Bottle Cleanser 500ml",
        shortDescription:
          "Plant-based bottle cleanser — removes milk residue without harsh chemicals.",
        description:
          "The Kidlon Baby Bottle Cleanser 500ml is specially formulated to break down milk proteins, fat, and oil residue from baby bottles, nipples, and breast pump parts. Made from plant-derived ingredients, it's free from phosphates, parabens, and artificial fragrances. Gentle on hands but tough on milk residue. Rinse-clean formula leaves no soapy taste.",
        priceBdt: 480,
        compareAtBdt: 580,
        costBdt: 260,
        sku: "HLT-CLN-500",
        barcode: "8945671258901",
        stock: 175,
        weightGrams: 540,
        isBestSeller: true,
        keyFeatures: [
          "Plant-based formula",
          "Removes milk proteins and fat",
          "Free from phosphates and parabens",
          "No artificial fragrances",
          "Rinse-clean — no soapy residue",
        ],
        tags: ["cleanser", "bottle-cleaner", "plant-based", "safe"],
        images: [
          placeholderImage("Kidlon Cleanser"),
          placeholderImage("Cleanser Bottle", 800, 800),
        ],
      },
      {
        slug: "baby-wet-wipes-sensitive-80-pack",
        name: "Baby Wet Wipes Sensitive (80 Pack)",
        shortDescription:
          "Ultra-soft sensitive wipes — 99% pure water, alcohol and fragrance free.",
        description:
          "The Baby Wet Wipes Sensitive (80 Pack) are made with 99% purified water and aloe vera extract, making them safe for the most delicate newborn skin. Free from alcohol, parabens, and fragrances. The thick, ultra-soft fabric cleans gently without tearing. Resealable sticker lid keeps wipes moist for weeks. Dermatologist tested.",
        priceBdt: 220,
        costBdt: 110,
        sku: "HLT-WIP-80",
        barcode: "8945671259012",
        stock: 380,
        weightGrams: 280,
        isBestSeller: true,
        keyFeatures: [
          "99% purified water formula",
          "Aloe vera extract for soothing",
          "Alcohol, paraben, fragrance free",
          "Thick, ultra-soft fabric",
          "Resealable sticker lid",
        ],
        tags: ["wipes", "sensitive", "newborn", "alcohol-free"],
        images: [
          placeholderImage("Baby Wet Wipes"),
          placeholderImage("Wipes Pack Detail", 800, 800),
        ],
      },
      {
        slug: "electric-baby-nail-trimmer",
        name: "Electric Baby Nail Trimmer",
        shortDescription:
          "Whisper-quiet electric nail trimmer with 6 interchangeable heads.",
        description:
          "The Electric Baby Nail Trimmer takes the fear out of trimming tiny nails. Whisper-quiet motor won't wake sleeping babies, and the gentle rotating action files nails smoothly without cutting skin. Includes 6 interchangeable heads (3 for baby, 2 for toddler, 1 for adult) and a built-in LED light for clear visibility. Operates on 2 AA batteries (not included).",
        priceBdt: 720,
        compareAtBdt: 900,
        costBdt: 410,
        sku: "HLT-NAIL-ELC",
        barcode: "8945671260123",
        stock: 92,
        weightGrams: 180,
        isFeatured: true,
        keyFeatures: [
          "Whisper-quiet motor",
          "6 interchangeable filing heads",
          "Built-in LED light",
          "Gentle action — safe on skin",
          "Operates on 2 AA batteries",
        ],
        tags: ["grooming", "nail-trimmer", "electric", "safety"],
        images: [
          placeholderImage("Electric Nail Trimmer"),
          placeholderImage("Trimmer Kit", 800, 800),
        ],
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// USERS — admin + sample customers
// -----------------------------------------------------------------------------

type SeedUser = {
  email: string;
  name: string;
  phone: string;
  passwordPlain: string;
  role: "ADMIN" | "USER";
};

const SEED_USERS: SeedUser[] = [
  {
    email: "admin@babyplanet.bd",
    name: "Site Administrator",
    phone: "+8801711000001",
    passwordPlain: "Admin#1234",
    role: "ADMIN",
  },
  {
    email: "rahima@example.com",
    name: "Rahima Akter",
    phone: "+8801711000002",
    passwordPlain: "Customer#1234",
    role: "USER",
  },
  {
    email: "karim@example.com",
    name: "Karim Uddin",
    phone: "+8801711000003",
    passwordPlain: "Customer#1234",
    role: "USER",
  },
];

// =============================================================================
// MAIN SEED EXECUTION
// =============================================================================

async function main(): Promise<void> {
  console.log("🌱  Baby Planet BD — Seeder starting...\n");

  // 1. Wipe existing data (safe in development; do NOT run in production)
  console.log("🧹  Cleaning existing data...");
  await prisma.$transaction([
    prisma.wishlistItem.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.address.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
    prisma.coupon.deleteMany(),
  ]);
  console.log("✓  Existing data wiped.\n");

  // 2. Seed users
  console.log("👥  Seeding users...");
  const userMap: Record<string, string> = {};
  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.passwordPlain, 12);
    const created = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        phone: u.phone,
        password: passwordHash,
        role: u.role,
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    userMap[u.email] = created.id;
    console.log(`   • ${u.role.padEnd(6)}  ${u.email}  →  ${created.id}`);
  }
  console.log(`✓  Seeded ${SEED_USERS.length} users.\n`);

  // 3. Seed categories + nested products
  console.log("📂  Seeding categories & products...");
  let productCount = 0;
  let featuredCount = 0;
  let bestSellerCount = 0;
  let totalInventoryValuePaisa = 0n;

  for (const cat of SEED_DATA) {
    const createdCategory = await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        iconUrl: cat.iconUrl,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    console.log(`   📁  ${cat.name}  →  ${createdCategory.id}  (${cat.products.length} products)`);

    for (const p of cat.products) {
      const pricePaisa = bdtToPaisa(p.priceBdt);
      const compareAtPricePaisa = p.compareAtBdt ? bdtToPaisa(p.compareAtBdt) : null;
      const costPricePaisa = p.costBdt ? bdtToPaisa(p.costBdt) : null;

      // Inventory value contribution: cost × stock
      if (costPricePaisa) {
        totalInventoryValuePaisa += costPricePaisa * BigInt(p.stock);
      }

      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          shortDescription: p.shortDescription,
          description: p.description,
          pricePaisa,
          compareAtPricePaisa,
          costPricePaisa,
          currency: "BDT",
          sku: p.sku,
          barcode: p.barcode ?? null,
          stock: p.stock,
          lowStockThreshold: 5,
          weightGrams: p.weightGrams ?? null,
          status: ProductStatus.ACTIVE,
          visibility: ProductVisibility.PUBLISHED,
          isFeatured: p.isFeatured ?? false,
          isBestSeller: p.isBestSeller ?? false,
          ratingAverage: 0,
          ratingCount: 0,
          salesCount: 0,
          categoryId: createdCategory.id,
          images: p.images as Prisma.InputJsonValue,
          keyFeatures: p.keyFeatures as Prisma.InputJsonValue,
          tags: p.tags as Prisma.InputJsonValue,
          attributes: {} as Prisma.InputJsonValue,
        },
      });
      productCount += 1;
      if (p.isFeatured) featuredCount += 1;
      if (p.isBestSeller) bestSellerCount += 1;
      console.log(`        • ${p.name}  —  ৳${p.priceBdt}  (stock: ${p.stock})`);
    }
  }

  console.log(`✓  Seeded ${SEED_DATA.length} categories & ${productCount} products.`);
  console.log(`   ⭐  Featured: ${featuredCount}   🏆  Best sellers: ${bestSellerCount}\n`);

  // 4. Seed a sample coupon
  console.log("🎟️  Seeding sample coupon...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off your first order — welcome to Baby Planet BD",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderPaisa: bdtToPaisa(500),
      maxDiscountPaisa: bdtToPaisa(200),
      usageLimit: 1000,
      usedCount: 0,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
      isActive: true,
    },
  });
  console.log("   • WELCOME10  →  10% off (min ৳500, max ৳200 off)\n");

  // 5. Summary
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("📊  SEED SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`   Users                : ${SEED_USERS.length}`);
  console.log(`   Categories           : ${SEED_DATA.length}`);
  console.log(`   Products             : ${productCount}`);
  console.log(`   Featured products    : ${featuredCount}`);
  console.log(`   Best sellers         : ${bestSellerCount}`);
  console.log(`   Coupons              : 1 (WELCOME10)`);
  console.log(`   Inventory value (cost): ৳${(Number(totalInventoryValuePaisa) / 100).toLocaleString()}`);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\n🌱  Seeder finished. Admin login: admin@babyplanet.bd / Admin#1234\n");
}

// -----------------------------------------------------------------------------
// Graceful shutdown
// -----------------------------------------------------------------------------

main()
  .catch((err) => {
    console.error("\n❌  Seeder failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
