/* Constants, helpers and seed data for Jenash. */

export const PAY_NOTE =
  "Payments here are simulated. To take real money, route checkout through a backend that calls Paystack (cards + Mobile Money) and verifies each transaction server-side.";

export const GHS = (n) =>
  "₵" +
  Number(n).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const uid = () => Math.random().toString(36).slice(2, 9);
export const orderNo = () => "JN-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export const CATEGORIES = ["Phones", "Electronics", "Fashion", "Home", "Beauty", "Groceries"];

export const catEmoji = (c) =>
  ({ Phones: "📱", Electronics: "🔌", Fashion: "👗", Home: "🏠", Beauty: "💄", Groceries: "🛒" }[c] ||
  "🛍️");

/* sellerId "jenash" = official store. User-listed products get the user's id. */
export const PRODUCTS = [
  { id: "p1", name: "Tecno Spark 20 Pro", cat: "Phones", price: 1899, rating: 4.6, sold: 412, emoji: "📱", sellerId: "jenash", sellerName: "Jenash Store", desc: "6.78″ display, 108MP camera, 5000mAh battery. Dual SIM." },
  { id: "p2", name: "Infinix Note 40", cat: "Phones", price: 2150, rating: 4.5, sold: 286, emoji: "📲", sellerId: "jenash", sellerName: "Jenash Store", desc: "AMOLED screen, fast 45W charging, sleek build." },
  { id: "p3", name: "Wireless Earbuds Pro", cat: "Electronics", price: 320, rating: 4.3, sold: 901, emoji: "🎧", sellerId: "jenash", sellerName: "Jenash Store", desc: "Active noise cancelling, 24hr playtime, USB-C." },
  { id: "p4", name: "65″ 4K Smart TV", cat: "Electronics", price: 5499, rating: 4.7, sold: 134, emoji: "📺", sellerId: "jenash", sellerName: "Jenash Store", desc: "Ultra HD, built-in streaming apps, slim bezel." },
  { id: "p5", name: "Ankara Print Dress", cat: "Fashion", price: 280, rating: 4.8, sold: 640, emoji: "👗", sellerId: "jenash", sellerName: "Jenash Store", desc: "Hand-tailored Ankara, vibrant print." },
  { id: "p6", name: "Leather Sandals", cat: "Fashion", price: 150, rating: 4.4, sold: 522, emoji: "🩴", sellerId: "jenash", sellerName: "Jenash Store", desc: "Genuine leather, locally crafted, durable sole." },
  { id: "p7", name: "Air Fryer 5L", cat: "Home", price: 690, rating: 4.6, sold: 388, emoji: "🍳", sellerId: "jenash", sellerName: "Jenash Store", desc: "Oil-free cooking, digital touch panel, family size." },
  { id: "p8", name: "Cotton Bedsheet Set", cat: "Home", price: 240, rating: 4.5, sold: 271, emoji: "🛏️", sellerId: "jenash", sellerName: "Jenash Store", desc: "King size, 100% cotton, 4-piece set." },
  { id: "p9", name: "Shea Butter Glow Kit", cat: "Beauty", price: 95, rating: 4.9, sold: 1203, emoji: "🧴", sellerId: "jenash", sellerName: "Jenash Store", desc: "Pure Ghanaian shea butter, body oil & lotion." },
  { id: "p10", name: "Matte Lip Set", cat: "Beauty", price: 120, rating: 4.4, sold: 477, emoji: "💄", sellerId: "jenash", sellerName: "Jenash Store", desc: "Long-wear, 6 shades, smudge-proof." },
  { id: "p11", name: "Jasmine Rice 25kg", cat: "Groceries", price: 410, rating: 4.7, sold: 690, emoji: "🍚", sellerId: "jenash", sellerName: "Jenash Store", desc: "Premium long-grain aromatic rice, bulk bag." },
  { id: "p12", name: "Pure Honey 1L", cat: "Groceries", price: 130, rating: 4.8, sold: 354, emoji: "🍯", sellerId: "jenash", sellerName: "Jenash Store", desc: "Raw, unfiltered, locally sourced honey." },
];

export const DEFAULT_COURIERS = [
  { id: "c1", name: "Yango Delivery", area: "Greater Accra", eta: "Same day", fee: 25 },
  { id: "c2", name: "SpeedExpress GH", area: "Nationwide", eta: "1–3 days", fee: 40 },
  { id: "c3", name: "Bolt Send", area: "Accra & Tema", eta: "Same day", fee: 30 },
];

export const TIMELINE = [
  "Order placed",
  "Confirmed & packed",
  "Picked by courier",
  "In transit",
  "Out for delivery",
  "Delivered",
];

export const WA = "233543813320";
export const TEL1 = "+233543813320";
export const TEL2 = "+233541725662";
export const EMAIL = "jenashtech@gmail.com";
