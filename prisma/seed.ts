import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  products: SeedProduct[];
};

type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceBdt: number;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const bdtToPaisa = (bdt: number): number => Math.round(bdt * 100);

const imgExt: Record<string, string> = {
  "mumlove-glass-feeding-bottle": "webp",
  "applebear-wide-neck-pp-bottle": "webp",
  "philips-avent-260ml-bottle": "webp",
  "philips-avent-125ml-bottle": "webp",
  "premium-silicone-bottle-cleaning-brush": "webp",
  "fruit-shape-silicone-baby-teether": "png",
  "imported-cute-mushroom-phone-toy": "jpg",
  "imported-non-slip-floor-socks": "png",
  "creative-baby-bus-straw-water-cup": "png",
  "bamboo-fiber-kids-tableware-set": "png",
  "portable-car-design-tiffin-box": "png",
  "multifunctional-japanese-lunch-box": "png",
  "creative-kids-stainless-lunch-box": "jpg",
  "imported-multifunctional-mommy-bag": "png",
  "childrens-premium-imported-hair-comb": "webp",
  "kids-knitted-vest-sweater": "png",
  "kids-summer-short-sleeve-knitted-set": "png",
  "imported-bubble-print-two-piece-outfit": "png",
  "strawberry-design-baby-girl-party-frock": "jpg",
  "sunflower-design-pure-cotton-frock": "jpg",
  "intelligent-rh228-double-breast-pump": "webp",
  "only-baby-manual-breast-pump": "webp",
  "baby-smile-washable-breast-pad": "webp",
  "momeasy-washable-breast-pad": "webp",
  "safe-baby-nasal-aspirator": "png",
};

const catImgExt: Record<string, string> = {
  "baby-feeding": "webp",
  "baby-toys-learning": "png",
  "school-outdoor": "png",
  "baby-clothing": "jpg",
  "mom-baby-care": "png",
};

const productImg = (slug: string): string =>
  `${API_BASE}/images/products/${slug}.${imgExt[slug] || "jpg"}`;

const categoryImg = (slug: string): string =>
  `${API_BASE}/images/categories/${slug}.${catImgExt[slug] || "jpg"}`;

const SEED_DATA: SeedCategory[] = [
  // =============================================================================
  // CATEGORY 1: Baby Feeding — bottles, nipples, brushes from babyplanet-bd.com
  // =============================================================================
  {
    slug: "baby-feeding",
    name: "Baby Feeding",
    description:
      "Premium baby feeding essentials including feeding bottles, silicone nipples, bottle cleaning brushes, and nursing accessories from trusted brands like Philips Avent, Mumlove, Applebear, and Rovco. BPA-free, anti-colic, and pediatrician-recommended.",
    imageUrl: categoryImg("baby-feeding"),
    sortOrder: 1,
    products: [
      {
        slug: "mumlove-glass-feeding-bottle",
        name: "Mumlove Baby Feeder Double Protection Unbreakable Glass Body Feeding Bottle with Handle & Silicon Cover",
        shortDescription:
          "Double-protection borosilicate glass bottle with silicone sleeve and handle for safe feeding.",
        description:
          "The Mumlove Baby Feeder Double Protection features a pharmaceutical-grade borosilicate glass body that resists thermal shock and never leaches chemicals. The protective silicone sleeve provides a non-slip grip and shields the bottle from minor drops. Includes a comfortable handle for baby's grip and a slow-flow silicone nipple suitable for newborns. BPA-free, dishwasher safe, and sterilizer compatible.",
        priceBdt: 350,
        costBdt: 180,
        sku: "ML-GLS-DP",
        barcode: "8945671201234",
        stock: 120,
        weightGrams: 260,
        isFeatured: true,
        keyFeatures: [
          "Borosilicate glass — thermal shock resistant",
          "Protective silicone sleeve for drop protection",
          "Ergonomic handle for baby's grip",
          "Slow-flow silicone nipple included",
          "Dishwasher and sterilizer safe",
        ],
        tags: ["bottle", "glass", "mumlove", "newborn", "feeding"],
        images: [productImg("mumlove-glass-feeding-bottle")],
      },
      {
        slug: "applebear-wide-neck-pp-bottle",
        name: "Applebear Wide Neck PP Plastic Feeding Bottle",
        shortDescription:
          "Affordable 250ml wide-neck polypropylene bottle for daily feeding.",
        description:
          "The Applebear Wide Neck PP Bottle delivers reliable feeding at an accessible price point. Made from food-grade polypropylene, this bottle is lightweight, durable, and BPA-free. The wide-neck opening makes it easy to fill and clean, while the medium-flow silicone nipple suits babies 3 months and older. Perfect as an everyday feeding bottle.",
        priceBdt: 350,
        costBdt: 150,
        sku: "AB-WN-250-PP",
        barcode: "8945671205678",
        stock: 240,
        weightGrams: 110,
        isBestSeller: true,
        keyFeatures: [
          "Food-grade polypropylene body",
          "250ml capacity with wide-neck design",
          "Medium-flow silicone nipple",
          "BPA-free and affordable",
          "Easy to clean and sterilize",
        ],
        tags: ["bottle", "pp", "wide-neck", "applebear", "budget"],
        images: [productImg("applebear-wide-neck-pp-bottle")],
      },
      {
        slug: "philips-avent-260ml-bottle",
        name: "Philips Avent Natural Response Plastic Baby Feeder 1m+ 260ml Baby Feeding Bottle",
        shortDescription:
          "Anti-colic 260ml bottle with Natural Response nipple for controlled feeding from 1 month+.",
        description:
          "The Philips Avent Natural Response 260ml feeding bottle is designed to mimic the natural breastfeeding experience. The Natural Response nipple only releases milk when baby actively drinks, reducing spit-up and overeating. The wide-neck design makes cleaning effortless, and the AirFree vent keeps air out of baby's tummy to reduce colic. Suitable for babies 1 month and older. BPA-free and dishwasher safe.",
        priceBdt: 950,
        compareAtBdt: 1100,
        costBdt: 620,
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
          "Suitable from 1 month+",
        ],
        tags: ["bottle", "philips", "avent", "anti-colic", "newborn"],
        images: [productImg("philips-avent-260ml-bottle")],
      },
      {
        slug: "philips-avent-125ml-bottle",
        name: "Philips Avent Natural Response Plastic Baby Feeder 0m+ 125ml Baby Feeding Bottle",
        shortDescription:
          "Compact 125ml bottle ideal for newborns 0m+ with Natural Response nipple.",
        description:
          "The Philips Avent Natural Response 125ml feeding bottle is the perfect size for newborns and small feeds from day one. Featuring the Natural Response nipple that mimics the breast, baby must actively drink to release milk. The integrated AirFree vent reduces colic and discomfort. Compact size fits easily in a diaper bag. BPA-free and dishwasher safe.",
        priceBdt: 850,
        compareAtBdt: 1000,
        costBdt: 540,
        sku: "PA-125-NR",
        barcode: "8710103905678",
        stock: 120,
        weightGrams: 140,
        keyFeatures: [
          "125ml capacity — ideal for newborns 0m+",
          "Natural Response nipple for breast-like feeding",
          "Anti-colic AirFree vent",
          "Compact, portable size",
          "BPA-free materials",
        ],
        tags: ["bottle", "philips", "avent", "newborn", "small-feed"],
        images: [productImg("philips-avent-125ml-bottle")],
      },
      {
        slug: "premium-silicone-bottle-cleaning-brush",
        name: "Premium Silicone Baby Bottle Cleaning Brush",
        shortDescription:
          "Food-grade silicone bottle brush with angled head and non-slip handle for thorough cleaning.",
        description:
          "The Premium Silicone Baby Bottle Cleaning Brush is designed to thoroughly clean bottles, nipples, and accessories without scratching. Made from food-grade silicone, the bristles are gentle on surfaces yet tough on residue. The angled brush head reaches every corner, and the non-slip handle ensures a comfortable grip. Quick-dry design prevents bacterial growth. BPA-free and heat resistant.",
        priceBdt: 350,
        compareAtBdt: 400,
        costBdt: 180,
        sku: "BR-SIL-BTL",
        barcode: "8945671301111",
        stock: 190,
        weightGrams: 80,
        keyFeatures: [
          "Food-grade silicone bristles — non-scratch",
          "Angled head for thorough cleaning",
          "Non-slip ergonomic handle",
          "Quick-dry design prevents bacteria",
          "BPA-free and heat resistant",
        ],
        tags: ["brush", "cleaning", "silicone", "bottle", "accessory"],
        images: [productImg("premium-silicone-bottle-cleaning-brush")],
      },
    ],
  },

  // =============================================================================
  // CATEGORY 2: Baby Toys & Learning — teethers, toys, socks from babyplanet-bd.com
  // =============================================================================
  {
    slug: "baby-toys-learning",
    name: "Baby Toys & Learning",
    description:
      "Fun and educational toys for early development including silicone teethers, pretend-play phones, non-slip socks, straw cups, and eco-friendly tableware sets. Designed to stimulate senses and support motor skills.",
    imageUrl: categoryImg("baby-toys-learning"),
    sortOrder: 2,
    products: [
      {
        slug: "fruit-shape-silicone-baby-teether",
        name: "Fruit Shape Silicone Baby Teether",
        shortDescription:
          "Colorful fruit-shaped silicone teether for soothing sore gums during teething.",
        description:
          "The Fruit Shape Silicone Baby Teether is a fun and functional teething toy designed to soothe sore, swollen gums. Made from 100% food-grade silicone, it is soft, flexible, and gentle on babies' delicate mouths. The bright fruit shapes attract baby's attention and encourage grasping, helping to develop fine motor skills. Easy for tiny hands to hold. BPA-free and phthalate-free.",
        priceBdt: 99,
        costBdt: 40,
        sku: "TTH-FRT-SIL",
        barcode: "8945671302222",
        stock: 300,
        weightGrams: 30,
        isFeatured: true,
        keyFeatures: [
          "100% food-grade silicone — safe for mouthing",
          "Fruit shapes attract and engage baby",
          "Soft, flexible texture soothes gums",
          "Easy-grip design for small hands",
          "BPA-free and phthalate-free",
        ],
        tags: ["teether", "silicone", "fruit", "teething", "toy"],
        images: [productImg("fruit-shape-silicone-baby-teether")],
      },
      {
        slug: "imported-cute-mushroom-phone-toy",
        name: "Imported Cute Mushroom Phone Toy",
        shortDescription:
          "Adorable mushroom-shaped pretend-play phone toy with buttons and sounds.",
        description:
          "The Imported Cute Mushroom Phone Toy is a delightful pretend-play accessory that sparks imagination and role-playing. Shaped like a friendly mushroom, it features colorful buttons that play sounds and melodies when pressed. Helps develop fine motor skills, cause-and-effect understanding, and auditory stimulation. Compact size perfect for little hands and on-the-go play.",
        priceBdt: 299,
        costBdt: 140,
        sku: "TOY-MSHRM-PHN",
        barcode: "8945671303333",
        stock: 85,
        weightGrams: 90,
        keyFeatures: [
          "Adorable mushroom design",
          "Colorful buttons with sounds and melodies",
          "Encourages imaginative pretend play",
          "Supports fine motor skill development",
          "Compact and portable",
        ],
        tags: ["toy", "phone", "mushroom", "pretend-play", "imported"],
        images: [productImg("imported-cute-mushroom-phone-toy")],
      },
      {
        slug: "imported-non-slip-floor-socks",
        name: "Imported Non Slip Floor Socks For Toddler",
        shortDescription:
          "Soft cotton socks with silicone grip dots for safe indoor walking.",
        description:
          "The Imported Non Slip Floor Socks are designed for toddlers learning to walk on smooth indoor floors. Made from soft, breathable cotton with reinforced toe and heel, these socks feature silicone grip dots on the sole that prevent slipping on tiles and hardwood. The gentle elastic cuff keeps socks in place without leaving marks. Available in assorted colors.",
        priceBdt: 120,
        compareAtBdt: 280,
        costBdt: 60,
        sku: "SOC-NS-TOD",
        barcode: "8945671304444",
        stock: 200,
        weightGrams: 50,
        isBestSeller: true,
        keyFeatures: [
          "Silicone grip dots for slip-resistant walking",
          "Soft breathable cotton fabric",
          "Reinforced toe and heel for durability",
          "Gentle elastic cuff — no marks",
          "Available in assorted colors",
        ],
        tags: ["socks", "non-slip", "toddler", "walking", "imported"],
        images: [productImg("imported-non-slip-floor-socks")],
      },
      {
        slug: "creative-baby-bus-straw-water-cup",
        name: "Creative Baby Bus Design Children's Straw Water Cup",
        shortDescription:
          "Cute bus-shaped 300ml kids water bottle with flip-up silicone straw.",
        description:
          "The Creative Baby Bus Straw Water Cup turns hydration into playtime. Shaped like a friendly yellow school bus, it holds 300ml of water or juice. The flip-up silicone straw is gentle on little mouths and the leak-proof lid prevents spills in backpacks. Easy-grip handles fold down for compact carrying. BPA-free and dishwasher safe. Recommended for ages 12 months+.",
        priceBdt: 750,
        costBdt: 380,
        sku: "BUS-STRW-300",
        barcode: "8945671305555",
        stock: 140,
        weightGrams: 180,
        keyFeatures: [
          "Cute school-bus design kids love",
          "300ml capacity",
          "Flip-up soft silicone straw",
          "Leak-proof lid for spill-free bags",
          "Foldable easy-grip handles",
        ],
        tags: ["water-cup", "straw", "bus", "kids", "hydration"],
        images: [productImg("creative-baby-bus-straw-water-cup")],
      },
      {
        slug: "bamboo-fiber-kids-tableware-set",
        name: "Bamboo Fiber Kid's Tableware Set",
        shortDescription:
          "Eco-friendly 5-piece dining set made from natural bamboo fiber.",
        description:
          "The Bamboo Fiber Kid's Tableware Set includes everything needed for independent meals: a divided plate, bowl, cup, fork, and spoon. Made from biodegradable bamboo fiber, this set is free from BPA, melamine, and phthalates. The bright, gender-neutral design makes meals fun, and the durable material won't shatter when dropped. Lightweight and easy for little hands to manage. Hand wash recommended.",
        priceBdt: 750,
        compareAtBdt: 850,
        costBdt: 420,
        sku: "BFM-TW-5P",
        barcode: "8945671306666",
        stock: 75,
        weightGrams: 520,
        isBestSeller: true,
        keyFeatures: [
          "5-piece set: plate, bowl, cup, fork, spoon",
          "Biodegradable bamboo fiber material",
          "BPA, melamine, and phthalate free",
          "Shatter-proof durable design",
          "Lightweight and eco-friendly",
        ],
        tags: ["tableware", "bamboo", "eco-friendly", "kids", "dining"],
        images: [productImg("bamboo-fiber-kids-tableware-set")],
      },
    ],
  },

  // =============================================================================
  // CATEGORY 3: School & Outdoor — tiffin boxes, lunch boxes, bags from babyplanet-bd.com
  // =============================================================================
  {
    slug: "school-outdoor",
    name: "School & Outdoor",
    description:
      "School essentials and outdoor gear for growing kids — car-design tiffin boxes, bento-style lunch boxes, stainless steel lunch boxes, mommy bags, and grooming accessories. Durable, leak-proof, and designed for daily use.",
    imageUrl: categoryImg("school-outdoor"),
    sortOrder: 3,
    products: [
      {
        slug: "portable-car-design-tiffin-box",
        name: "Portable Car Design Tiffin Box Food-Grade",
        shortDescription:
          "Adorable 3-compartment car-shaped lunch box with secure locking clips.",
        description:
          "The Portable Car Design Tiffin Box makes lunchtime fun for kids. Shaped like a friendly cartoon car, this 3-compartment tiffin separates rice, curry, and snacks. Made from food-grade PP material with secure locking clips on all four sides to prevent spills. Microwave safe without lid and dishwasher safe. Perfect for school lunches.",
        priceBdt: 520,
        costBdt: 260,
        sku: "TFN-CAR-3C",
        barcode: "8945671401111",
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
        tags: ["tiffin", "lunch-box", "car", "kids", "school"],
        images: [productImg("portable-car-design-tiffin-box")],
      },
      {
        slug: "multifunctional-japanese-lunch-box",
        name: "Multifunctional Japanese-Style Lunch Box Portable",
        shortDescription:
          "Stackable bento-style lunch box with chopsticks and carrying strap.",
        description:
          "The Multifunctional Japanese-Style Lunch Box brings authentic bento culture to your child's day. This 2-tier stackable bento includes a removable divider, matching chopsticks with case, and an elastic carrying strap. The airtight silicone seal keeps food fresh for hours. Made from BPA-free materials. Microwave and dishwasher safe.",
        priceBdt: 599,
        compareAtBdt: 700,
        costBdt: 320,
        sku: "LCH-JP-BENTO",
        barcode: "8945671402222",
        stock: 62,
        weightGrams: 380,
        keyFeatures: [
          "Authentic 2-tier bento design",
          "Includes chopsticks with case",
          "Airtight silicone seal",
          "Elastic carrying strap included",
          "BPA-free and dishwasher safe",
        ],
        tags: ["lunch-box", "bento", "japanese", "stackable", "school"],
        images: [productImg("multifunctional-japanese-lunch-box")],
      },
      {
        slug: "creative-kids-stainless-lunch-box",
        name: "Creative Kids' Double Layer Stainless Steel Lunch Box",
        shortDescription:
          "Durable 304-grade stainless steel double-layer lunch box with leak-proof seal.",
        description:
          "The Creative Kids' Double Layer Stainless Steel Lunch Box is built to last for years. Made from premium 304 food-grade stainless steel, it won't absorb odors, stains, or flavors. The double-layer design separates rice from curry, and the silicone ring seal prevents leaks even when carried sideways. Dishwasher safe and rust-proof. A durable, eco-friendly alternative to plastic lunch boxes.",
        priceBdt: 799,
        compareAtBdt: 950,
        costBdt: 480,
        sku: "LCH-SS-2L",
        barcode: "8945671403333",
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
        tags: ["lunch-box", "stainless-steel", "double-layer", "durable", "eco-friendly"],
        images: [productImg("creative-kids-stainless-lunch-box")],
      },
      {
        slug: "imported-multifunctional-mommy-bag",
        name: "Imported Branded Multifunctional Crossbody Mommy Bag – Insular (20L)",
        shortDescription:
          "Spacious 20L crossbody mommy bag with insulated bottle pocket and changing mat.",
        description:
          "The Imported Branded Multifunctional Crossbody Mommy Bag is the ultimate companion for outings with baby. Crafted from water-resistant Oxford cloth, it features 8 organized compartments including an insulated bottle pocket, wet-dry separation pouch, and a built-in baby changing mat. The adjustable crossbody strap keeps hands free. 20L capacity is perfect for day trips. Available in multiple colors.",
        priceBdt: 1250,
        costBdt: 700,
        sku: "MMY-BAG-20L",
        barcode: "8945671404444",
        stock: 45,
        weightGrams: 680,
        isFeatured: true,
        keyFeatures: [
          "20L spacious capacity",
          "Water-resistant Oxford cloth exterior",
          "8 organized compartments",
          "Insulated bottle pocket",
          "Includes foldable changing mat",
        ],
        tags: ["mommy-bag", "diaper-bag", "crossbody", "travel", "imported"],
        images: [productImg("imported-multifunctional-mommy-bag")],
      },
      {
        slug: "childrens-premium-imported-hair-comb",
        name: "Children's Premium Imported Hair Comb",
        shortDescription:
          "Dual-side wooden baby comb with fine and wide teeth for tangle-free grooming.",
        description:
          "The Children's Premium Imported Hair Comb features a dual-sided design with fine teeth on one side and wide teeth on the other, perfect for all hair types. Made from sustainably sourced beech wood with smooth rounded teeth that won't scratch baby's sensitive scalp. Compact size fits in any diaper bag. A practical everyday grooming essential.",
        priceBdt: 280,
        costBdt: 120,
        sku: "GRM-CMB-WD",
        barcode: "8945671405555",
        stock: 220,
        weightGrams: 60,
        keyFeatures: [
          "Dual-side: fine + wide teeth",
          "Sustainably sourced beech wood",
          "Smooth rounded teeth — scalp-safe",
          "Compact travel size",
          "Suitable for all hair types",
        ],
        tags: ["comb", "hair", "grooming", "wooden", "imported"],
        images: [productImg("childrens-premium-imported-hair-comb")],
      },
    ],
  },

  // =============================================================================
  // CATEGORY 4: Baby Clothing — outfits, frocks, sets from babyplanet-bd.com
  // =============================================================================
  {
    slug: "baby-clothing",
    name: "Baby Clothing",
    description:
      "Soft, breathable, and stylish clothing for babies and toddlers — from summer knitted sets and bubble print outfits to embroidered party frocks and pure cotton dresses. Each piece is gentle on delicate skin and built for active little ones.",
    imageUrl: categoryImg("baby-clothing"),
    sortOrder: 4,
    products: [
      {
        slug: "kids-summer-short-sleeve-knitted-set",
        name: "Kids' Summer Short-Sleeve Knitted Two-Piece Set",
        shortDescription:
          "Breathable 2-piece cotton knit set perfect for hot summer days.",
        description:
          "The Kids' Summer Short-Sleeve Knitted Set is designed for Bangladesh's warm climate. Made from 100% combed cotton with a breathable knit weave, this 2-piece top-and-shorts set keeps little ones cool and comfortable. The elastic waistband ensures a perfect fit, and the soft pastel color palette suits both boys and girls. Machine washable.",
        priceBdt: 770,
        costBdt: 420,
        sku: "CLTH-KNIT-SMR",
        barcode: "8945671501111",
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
        images: [productImg("kids-summer-short-sleeve-knitted-set")],
      },
      {
        slug: "imported-bubble-print-two-piece-outfit",
        name: "Imported Bubble Print Round-Neck Short-Sleeve Baby Top & Casual Trousers Two-Piece Set – Trendy Outfit",
        shortDescription:
          "Trendy bubble-print 2-piece outfit with matching casual trousers.",
        description:
          "The Imported Bubble Print Two-Piece Outfit features a playful bubble pattern on premium cotton-blend fabric. This trendy set includes a round-neck short-sleeve top and matching casual trousers. Imported quality with reinforced seams for active toddlers. The elastic waistband on trousers ensures a comfortable fit. Available in multiple colorways. Machine washable.",
        priceBdt: 999,
        costBdt: 550,
        sku: "CLTH-BUBL-2P",
        barcode: "8945671502222",
        stock: 65,
        weightGrams: 280,
        keyFeatures: [
          "Playful bubble print design",
          "Round-neck top + casual trousers",
          "Reinforced seams for active play",
          "Soft cotton-blend fabric",
          "Imported quality",
        ],
        tags: ["clothing", "outfit", "bubble-print", "toddler", "imported"],
        images: [productImg("imported-bubble-print-two-piece-outfit")],
      },
      {
        slug: "strawberry-design-baby-girl-party-frock",
        name: "Strawberry Design Baby Girl Layered Party Frock",
        shortDescription:
          "Adorable strawberry-themed layered party frock for special occasions.",
        description:
          "The Strawberry Design Baby Girl Party Frock is perfect for birthdays, weddings, and festive celebrations. Featuring a charming strawberry pattern with layered tiers for volume and movement. The soft cotton lining keeps baby comfortable all day, while the button back closure makes dressing easy. Available for ages 1-5 years. A delightful addition to any little girl's wardrobe.",
        priceBdt: 799,
        costBdt: 440,
        sku: "CLTH-STRW-FRK",
        barcode: "8945671503333",
        stock: 38,
        weightGrams: 320,
        isFeatured: true,
        keyFeatures: [
          "Charming strawberry design",
          "Layered tiers for volume",
          "Soft cotton lining",
          "Button back closure",
          "Available for ages 1-5 years",
        ],
        tags: ["clothing", "frock", "party", "girls", "strawberry"],
        images: [productImg("strawberry-design-baby-girl-party-frock")],
      },
      {
        slug: "sunflower-design-pure-cotton-frock",
        name: "Sunflower Design Pure Cotton Full Sleeve Baby Girl Frock",
        shortDescription:
          "Cheerful sunflower-print 100% cotton frock for daily wear.",
        description:
          "The Sunflower Design Pure Cotton Frock brings sunshine to everyday outfits. Made from 100% pure cotton with a cheerful sunflower print, this full-sleeve frock is perfect for daily wear, family outings, and playtime. Features a flattering neckline, button back closure, and gentle fit. Soft, breathable, and gentle on sensitive skin.",
        priceBdt: 850,
        costBdt: 460,
        sku: "CLTH-SUN-FRK",
        barcode: "8945671504444",
        stock: 88,
        weightGrams: 260,
        keyFeatures: [
          "100% pure cotton fabric",
          "Cheerful sunflower print",
          "Full-sleeve design",
          "Button back closure",
          "Soft and breathable",
        ],
        tags: ["clothing", "frock", "cotton", "girls", "sunflower"],
        images: [productImg("sunflower-design-pure-cotton-frock")],
      },
      {
        slug: "kids-knitted-vest-sweater",
        name: "Imported Children's Knitted Vest Sweater",
        shortDescription:
          "Warm and stylish knitted vest sweater for cooler days.",
        description:
          "The Imported Children's Knitted Vest Sweater is a versatile layering piece for cooler weather. Made from soft, breathable acrylic-cotton blend with a classic knit pattern. The sleeveless design allows easy movement while keeping the core warm. Features ribbed trim at neckline, armholes, and hem. Perfect worn over a shirt or on its own. Available in multiple sizes for ages 2-8 years.",
        priceBdt: 700,
        compareAtBdt: 850,
        costBdt: 380,
        sku: "CLTH-KNIT-VST",
        barcode: "8945671505555",
        stock: 55,
        weightGrams: 200,
        keyFeatures: [
          "Soft acrylic-cotton blend knit",
          "Sleeveless vest design for layering",
          "Ribbed trim at neck, armholes, and hem",
          "Classic knit pattern",
          "Available for ages 2-8 years",
        ],
        tags: ["clothing", "sweater", "vest", "knit", "imported"],
        images: [productImg("kids-knitted-vest-sweater")],
      },
    ],
  },

  // =============================================================================
  // CATEGORY 5: Mom & Baby Care — pumps, pads, aspirators, cleansers from babyplanet-bd.com
  // =============================================================================
  {
    slug: "mom-baby-care",
    name: "Mom & Baby Care",
    description:
      "Essential care products for mothers and babies — breast pumps, washable nursing pads, nasal aspirators, bottle cleansers, and grooming essentials. Selected for safety, comfort, and reliability.",
    imageUrl: categoryImg("mom-baby-care"),
    sortOrder: 5,
    products: [
      {
        slug: "intelligent-rh228-double-breast-pump",
        name: "Intelligent RH228 Automatic Double Breast Pump",
        shortDescription:
          "Hospital-grade double electric breast pump with adjustable suction.",
        description:
          "The Intelligent RH228 Automatic Double Breast Pump is a powerful pump that expresses milk from both breasts simultaneously, cutting pumping time in half. Features adjustable suction levels and multiple expression modes. The closed-system design prevents milk backflow and ensures hygiene. Rechargeable battery provides cordless use. Includes two BPA-free bottles, tubing, and silicone breast shields.",
        priceBdt: 1450,
        compareAtBdt: 1650,
        costBdt: 950,
        sku: "RH228-DBL",
        barcode: "6938900123456",
        stock: 32,
        weightGrams: 850,
        isFeatured: true,
        isBestSeller: true,
        keyFeatures: [
          "Double-sided pumping — saves time",
          "Adjustable suction levels",
          "Closed system — prevents milk backflow",
          "Rechargeable battery for cordless use",
          "Includes BPA-free bottles and shields",
        ],
        tags: ["breast-pump", "electric", "double", "maternity", "rh228"],
        images: [productImg("intelligent-rh228-double-breast-pump")],
      },
      {
        slug: "only-baby-manual-breast-pump",
        name: "Only Baby Manual Breast Pump",
        shortDescription:
          "Lightweight manual pump with soft silicone horn and ergonomic handle.",
        description:
          "The Only Baby Manual Breast Pump is the perfect on-the-go solution for moms who prefer quiet, portable pumping. The soft silicone cushion stimulates letdown gently, while the ergonomic lever handle minimizes hand fatigue. BPA-free and dishwasher safe — disassembles in seconds for thorough cleaning. Includes a storage bottle with sealing disc. Compact and travel-friendly.",
        priceBdt: 880,
        compareAtBdt: 1080,
        costBdt: 500,
        sku: "OB-MAN-BP",
        barcode: "6938900127890",
        stock: 78,
        weightGrams: 320,
        keyFeatures: [
          "Soft silicone horn for gentle letdown",
          "Ergonomic lever — minimal hand fatigue",
          "BPA-free, dishwasher safe",
          "Includes storage bottle with sealing disc",
          "Compact, travel-friendly design",
        ],
        tags: ["breast-pump", "manual", "portable", "maternity", "only-baby"],
        images: [productImg("only-baby-manual-breast-pump")],
      },
      {
        slug: "baby-smile-washable-breast-pad",
        name: "Baby Smile Washable Breast Pad Nursing Pad (4 Pcs)",
        shortDescription:
          "Ultra-soft bamboo washable nursing pads — 4 piece pack with leak-proof backing.",
        description:
          "The Baby Smile Washable Breast Pad pack includes 4 ultra-soft nursing pads made from natural bamboo charcoal fiber. The 4-layer construction absorbs leaks quickly while the waterproof PUL backing prevents leaks from reaching clothing. Breathable and reusable — wash in warm water and air dry. One size fits most nursing mothers. An eco-friendly alternative to disposable pads.",
        priceBdt: 290,
        compareAtBdt: 450,
        costBdt: 140,
        sku: "BS-WBP-4",
        barcode: "6938900128906",
        stock: 200,
        weightGrams: 90,
        keyFeatures: [
          "Bamboo charcoal fiber — naturally antibacterial",
          "4-layer absorbent core",
          "Waterproof PUL backing",
          "Reusable and machine washable",
          "Pack of 4 pads",
        ],
        tags: ["breast-pad", "washable", "bamboo", "nursing", "eco-friendly"],
        images: [productImg("baby-smile-washable-breast-pad")],
      },
      {
        slug: "momeasy-washable-breast-pad",
        name: "Momeasy Washable Breast Pad Nursing Pad 6 Pcs",
        shortDescription:
          "Premium 6-piece pack of washable bamboo nursing pads with mesh laundry pouch.",
        description:
          "The Momeasy Washable Breast Pad 6-pack offers premium comfort for nursing mothers. Made with multiple layers of organic bamboo cotton, these pads wick moisture away from skin, keeping mom dry and comfortable. The waterproof backing protects clothing from leaks. Includes a free mesh laundry pouch for easy washing. Reusable and eco-friendly.",
        priceBdt: 440,
        compareAtBdt: 550,
        costBdt: 240,
        sku: "ME-WBP-6",
        barcode: "6938900129019",
        stock: 180,
        weightGrams: 130,
        keyFeatures: [
          "Multi-layer organic bamboo cotton",
          "Waterproof leak-proof backing",
          "Includes free mesh laundry pouch",
          "Pack of 6 pads",
          "Reusable, eco-friendly",
        ],
        tags: ["breast-pad", "washable", "momeasy", "nursing", "bamboo"],
        images: [productImg("momeasy-washable-breast-pad")],
      },
      {
        slug: "safe-baby-nasal-aspirator",
        name: "Safe Baby Nasal Aspirator",
        shortDescription:
          "Gentle manual nasal aspirator with soft silicone tip and reusable filter.",
        description:
          "The Safe Baby Nasal Aspirator provides gentle, effective relief from congested little noses. The soft silicone tip is gentle on baby's nostrils, while the parent-controlled suction ensures safe, comfortable clearing. Includes 2 reusable washable filters and a protective storage case. BPA-free and sterilizer safe. Compact enough for the diaper bag.",
        priceBdt: 250,
        compareAtBdt: 400,
        costBdt: 120,
        sku: "HLT-NASL-MAN",
        barcode: "8945671601111",
        stock: 145,
        weightGrams: 90,
        isBestSeller: true,
        keyFeatures: [
          "Soft silicone tip — gentle on nostrils",
          "Parent-controlled suction",
          "Includes 2 reusable filters",
          "Protective storage case",
          "BPA-free, sterilizer safe",
        ],
        tags: ["health", "nasal-aspirator", "safety", "newborn", "grooming"],
        images: [productImg("safe-baby-nasal-aspirator")],
      },
    ],
  },
];

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

async function main(): Promise<void> {
  console.log("Seeding Baby Planet BD database...\n");

  // 1. Wipe existing data
  console.log("Cleaning existing data...");
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
  console.log("Existing data wiped.\n");

  // 2. Seed users
  console.log("Seeding users...");
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
    console.log(`  ${u.role.padEnd(6)}  ${u.email}  ->  ${created.id}`);
  }
  console.log(`Seeded ${SEED_USERS.length} users.\n`);

  // 3. Seed categories + products
  console.log("Seeding categories & products...");
  let productCount = 0;
  let featuredCount = 0;
  let bestSellerCount = 0;
  let totalInventoryValuePaisa = 0;

  for (const cat of SEED_DATA) {
    const createdCategory = await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ${cat.name}  (${cat.products.length} products)`);

    for (const p of cat.products) {
      const pricePaisa = bdtToPaisa(p.priceBdt);
      const compareAtPricePaisa = p.compareAtBdt ? bdtToPaisa(p.compareAtBdt) : null;
      const costPricePaisa = p.costBdt ? bdtToPaisa(p.costBdt) : null;

      if (costPricePaisa) {
        totalInventoryValuePaisa += costPricePaisa * p.stock;
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
          status: "ACTIVE",
          visibility: "PUBLISHED",
          isFeatured: p.isFeatured ?? false,
          isBestSeller: p.isBestSeller ?? false,
          ratingAverage: 0,
          ratingCount: 0,
          salesCount: 0,
          categoryId: createdCategory.id,
          images: JSON.stringify(p.images),
          keyFeatures: JSON.stringify(p.keyFeatures),
          tags: JSON.stringify(p.tags),
          attributes: JSON.stringify({}),
        },
      });
      productCount += 1;
      if (p.isFeatured) featuredCount += 1;
      if (p.isBestSeller) bestSellerCount += 1;
    }
  }

  console.log(`Seeded ${SEED_DATA.length} categories & ${productCount} products.`);
  console.log(`Featured: ${featuredCount} | Best sellers: ${bestSellerCount}\n`);

  // 4. Seed coupon
  console.log("Seeding coupon...");
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
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      isActive: true,
    },
  });
  console.log("  WELCOME10 -> 10% off (min 500, max 200 off)\n");

  // 5. Summary
  console.log("========================================");
  console.log("SEED SUMMARY");
  console.log("========================================");
  console.log(`  Users          : ${SEED_USERS.length}`);
  console.log(`  Categories     : ${SEED_DATA.length}`);
  console.log(`  Products       : ${productCount}`);
  console.log(`  Featured       : ${featuredCount}`);
  console.log(`  Best sellers   : ${bestSellerCount}`);
  console.log(`  Coupons        : 1 (WELCOME10)`);
  console.log(`  Inventory value: ৳${(totalInventoryValuePaisa / 100).toLocaleString()}`);
  console.log(`  Images served  : ${API_BASE}/images/products/`);
  console.log("========================================");
  console.log("\nSeeder finished. Admin login: admin@babyplanet.bd / Admin#1234\n");
}

main()
  .catch((err) => {
    console.error("Seeder failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
