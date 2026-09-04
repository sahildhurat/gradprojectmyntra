import { Product } from "./types";

export const products: Product[] = [
  {
    id: "prod_dress_01",
    name: "Floral Wrap Midi Dress",
    brand: "Sassafras",
    category: "dress",
    price: 1899,
    imageUrl: "/images/products/dress_01.webp",
    rating: 3.8,
    ratingCount: 1245,
    savedDaysAgo: 2,
    attributes: [
      { id: "pa_1", name: "Material", value: "100% Viscose Rayon" },
      { id: "pa_2", name: "Fit", value: "Wrap style, adjustable waist" },
      { id: "pa_3", name: "Care", value: "Machine wash cold, prone to slight shrinkage" }
    ],
    evidence: [
      { id: "ev_dress01_r1", type: "review", content: "Beautiful print, but the chest area is very tight if you have a larger bust. Size up!", rating: 3, source: "Verified Purchase" },
      { id: "ev_dress01_r2", type: "review", content: "I am usually a Medium, but the M was gaping at the neckline. Had to use a safety pin.", rating: 2, source: "Verified Purchase" },
      { id: "ev_dress01_r3", type: "review", content: "Perfect for a brunch date. The rayon material wrinkles easily though.", rating: 4, source: "Verified Purchase" },
      { id: "ev_dress01_pa1", type: "product_attribute", content: "100% Viscose Rayon. Viscose rayon has a tendency to shrink 3-5% on the first wash." },
      { id: "ev_dress01_sc1", type: "size_chart", content: "Size M: Bust 36in, Waist adjustable. Size L: Bust 38in, Waist adjustable." }
    ],
    verification: {
      brandAuthorised: true,
      verifiedPurchaseShare: 0.82,
      styleCode: "SF-DR-8991",
      returnsWindow: 14,
      refundProtection: true,
      exchangePolicy: true
    },
    sizeChart: {
      availableSizes: ["S", "M", "L", "XL"],
      measurements: {
        "S": { "bust": "34in", "length": "44in" },
        "M": { "bust": "36in", "length": "44.5in" },
        "L": { "bust": "38in", "length": "45in" },
        "XL": { "bust": "40in", "length": "45.5in" }
      },
      fitNote: "Wrap style allows 1-2 inch waist adjustability. Bust runs snug."
    },
    fallbackAssessment: null
  },
  {
    id: "prod_shirt_01",
    name: "Premium Supima Cotton Oxford Shirt",
    brand: "Marks & Spencer",
    category: "shirt",
    price: 3499,
    imageUrl: "/images/products/shirt_01.webp",
    rating: 4.6,
    ratingCount: 312,
    savedDaysAgo: 5,
    attributes: [
      { id: "pa_1", name: "Material", value: "100% Supima Cotton" },
      { id: "pa_2", name: "Weave", value: "Oxford" },
      { id: "pa_3", name: "Fit", value: "Regular Fit" }
    ],
    evidence: [
      { id: "ev_shirt01_r1", type: "review", content: "Expensive but completely worth it. I've washed it 10 times and the collar is still crisp.", rating: 5, source: "Verified Purchase" },
      { id: "ev_shirt01_r2", type: "review", content: "Supima cotton feels incredible against the skin. Great office wear.", rating: 5, source: "Verified Purchase" },
      { id: "ev_shirt01_pa1", type: "product_attribute", content: "Made from Supima cotton, known for superior strength, softness, and color retention over standard cotton." }
    ],
    verification: {
      brandAuthorised: true,
      verifiedPurchaseShare: 0.95,
      styleCode: "MS-OX-SUP-01",
      returnsWindow: 30,
      refundProtection: true,
      exchangePolicy: true
    },
    fallbackAssessment: null
  },
  {
    id: "prod_lehenga_01",
    name: "Heavy Embroidered Zari Lehenga Choli",
    brand: "Mitera",
    category: "lehenga",
    price: 8999,
    originalPrice: 12999,
    imageUrl: "/images/products/lehenga_01.webp",
    rating: 4.1,
    ratingCount: 45,
    savedDaysAgo: 12,
    attributes: [
      { id: "pa_1", name: "Material", value: "Art Silk with heavy Zari work" },
      { id: "pa_2", name: "Weight", value: "2.5 kg" },
      { id: "pa_3", name: "Care", value: "Dry clean only" }
    ],
    evidence: [
      { id: "ev_leh01_r1", type: "review", content: "Wore this to my sister's wedding. Looked stunning but it is VERY heavy.", rating: 4, source: "Verified Purchase" },
      { id: "ev_leh01_r2", type: "review", content: "The embroidery is beautiful but the inner lining is slightly scratchy.", rating: 3, source: "Verified Purchase" },
      { id: "ev_leh01_pa1", type: "product_attribute", content: "Highly intricate zari and sequin embroidery intended for bridal/festive occasions." }
    ],
    verification: {
      brandAuthorised: false,
      verifiedPurchaseShare: 0.60,
      styleCode: null,
      returnsWindow: 7,
      refundProtection: true,
      exchangePolicy: false
    },
    fallbackAssessment: null
  },
  {
    id: "prod_sneakers_01",
    name: "Classic Court Vision Low Sneakers",
    brand: "Nike",
    category: "sneakers",
    price: 2499,
    originalPrice: 5999,
    imageUrl: "/images/products/sneakers_01.webp",
    rating: 4.4,
    ratingCount: 8900,
    savedDaysAgo: 1,
    attributes: [
      { id: "pa_1", name: "Upper", value: "Synthetic Leather" },
      { id: "pa_2", name: "Sole", value: "Rubber Cupsole" },
      { id: "pa_3", name: "Style", value: "Retro basketball" }
    ],
    evidence: [
      { id: "ev_snk01_r1", type: "review", content: "Got these on a crazy discount! Authentic Nike box, scanned the QR code. They are legit.", rating: 5, source: "Verified Purchase" },
      { id: "ev_snk01_r2", type: "review", content: "A bit stiff out of the box, needs a few days to break in.", rating: 4, source: "Verified Purchase" },
      { id: "ev_snk01_pa1", type: "product_attribute", content: "End-of-season clearance item, hence the steep discount." }
    ],
    verification: {
      brandAuthorised: true,
      verifiedPurchaseShare: 0.98,
      styleCode: "CD5463-100",
      returnsWindow: 14,
      refundProtection: true,
      exchangePolicy: true
    },
    fallbackAssessment: null
  },
  {
    id: "prod_top_01",
    name: "Oversized Anime Graphic Drop-Shoulder Tee",
    brand: "Dillinger",
    category: "top",
    price: 1299,
    imageUrl: "/images/products/top_01.webp",
    rating: 3.5,
    ratingCount: 89,
    savedDaysAgo: 4,
    attributes: [
      { id: "pa_1", name: "Material", value: "100% Cotton, 180 GSM" },
      { id: "pa_2", name: "Fit", value: "Oversized / Drop Shoulder" },
      { id: "pa_3", name: "Print", value: "High-density rubber print" }
    ],
    evidence: [
      { id: "ev_top01_r1", type: "review", content: "Cool graphic but the print started cracking after 4 washes in the machine.", rating: 2, source: "Verified Purchase" },
      { id: "ev_top01_r2", type: "review", content: "Really trendy fit, perfect for streetwear looks.", rating: 5, source: "Verified Purchase" },
      { id: "ev_top01_pa1", type: "product_attribute", content: "Trendy drop-shoulder silhouette, highly specific to current streetwear trends." }
    ],
    verification: {
      brandAuthorised: true,
      verifiedPurchaseShare: 0.70,
      styleCode: "DL-GR-092",
      returnsWindow: 14,
      refundProtection: true,
      exchangePolicy: true
    },
    fallbackAssessment: null
  },
  {
    id: "prod_trousers_01",
    name: "Smart Tapered Stretch Chinos",
    brand: "H&M",
    category: "trousers",
    price: 1499,
    imageUrl: "/images/products/trousers_01.webp",
    rating: 4.7,
    ratingCount: 4120,
    savedDaysAgo: 10,
    attributes: [
      { id: "pa_1", name: "Material", value: "98% Cotton, 2% Elastane" },
      { id: "pa_2", name: "Fit", value: "Tapered fit, mid-rise" },
      { id: "pa_3", name: "Stretch", value: "2-way comfort stretch" }
    ],
    evidence: [
      { id: "ev_trs01_r1", type: "review", content: "The best chinos I own. I wear them to work twice a week and they hold their shape perfectly.", rating: 5, source: "Verified Purchase" },
      { id: "ev_trs01_r2", type: "review", content: "True to size. The 2% elastane gives just enough stretch when sitting.", rating: 5, source: "Verified Purchase" },
      { id: "ev_trs01_r3", type: "review", content: "Color fades slightly after a year, but for 1500 bucks it's a steal.", rating: 4, source: "Verified Purchase" },
      { id: "ev_trs01_pa1", type: "product_attribute", content: "Cotton-elastane blend designed for everyday utility, mobility, and high wear frequency." }
    ],
    verification: {
      brandAuthorised: true,
      verifiedPurchaseShare: 0.88,
      styleCode: "0981245001",
      returnsWindow: 14,
      refundProtection: true,
      exchangePolicy: true
    },
    fallbackAssessment: null
  }
];
