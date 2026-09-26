const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/products.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace any leftover 'Brand 2 Brand' with 'Skplore'
content = content.replace(/brand:\s*'Brand 2 Brand'/g, "brand: 'Skplore'");
content = content.replace(/Vizag summers/g, 'Hyderabad summers');
content = content.replace(/Vizag streets/g, 'Hyderabad streets');

// Add gender: 'men' to clothing items that lack a gender property
content = content.replace(/(category:\s*'clothing',\s*\n\s*subcategory:\s*'[a-z\-]+',)(?!\s*\n\s*gender:)/g, "$1\n    gender: 'men',");

// Add gender: 'women' to bag-001 if needed
content = content.replace(/(id:\s*'bag-001',[\s\S]*?subcategory:\s*'bags',)/, "$1\n    gender: 'women',");

// Prepare additional women clothing and gadgets products
const extraProducts = `
  // ═══════════════════════════════════════════
  // WOMEN'S CLOTHING (fashion → clothing)
  // ═══════════════════════════════════════════
  {
    id: 'dress-001',
    name: 'Satin Noir Belted Blazer Dress',
    brand: 'Skplore',
    category: 'clothing',
    subcategory: 'dresses',
    gender: 'women',
    price: 3499,
    originalPrice: 5499,
    description: 'Chic structured blazer dress featuring notched lapels, a cinched metallic buckle belt, and premium satin lining. Perfect for formal evenings and cocktail affairs.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Burgundy'],
    badge: 'BESTSELLER',
    atmosphere: 'clothing',
    images: [
      '/images/fashion-women-hero.png',
      '/images/fashion-atmosphere.png',
    ],
  },
  {
    id: 'coord-001',
    name: 'Monochrome Ribbed Knit Co-ord Set',
    brand: 'Skplore',
    category: 'clothing',
    subcategory: 'co-ords',
    gender: 'women',
    price: 2899,
    originalPrice: 4299,
    description: 'Sophisticated two-piece ribbed knit set tailored for ultimate comfort and contemporary elegance. Ideal for travel, lounge, and high-street styling.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Charcoal'],
    badge: 'NEW',
    atmosphere: 'clothing',
    images: [
      '/images/fashion-women-hero.png',
      '/images/brand_story_hyderabad.png',
    ],
  },
  {
    id: 'dress-002',
    name: 'Emerald Pleated Maxi Evening Gown',
    brand: 'Skplore',
    category: 'clothing',
    subcategory: 'dresses',
    gender: 'women',
    price: 4599,
    originalPrice: 6999,
    description: 'Flowing pleated emerald gown designed with graceful movement and an elegant neckline. A showstopper for celebrations and gala events.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Emerald Green'],
    badge: 'EXCLUSIVE',
    atmosphere: 'clothing',
    images: [
      '/images/fashion-women-hero.png',
      '/images/fashion-atmosphere.png',
    ],
  },

  // ═══════════════════════════════════════════
  // GADGETS & TECH ACCESSORIES
  // ═══════════════════════════════════════════
  {
    id: 'gadget-001',
    name: 'Aether Pro Carbon Fiber Phone Case',
    brand: 'Skplore Tech',
    category: 'gadgets',
    subcategory: 'phone-cases',
    gender: 'unisex',
    price: 1499,
    originalPrice: 2299,
    description: 'Aerospace-grade woven carbon fiber protective case with MagSafe magnetic array, tactile aluminum buttons, and 10ft drop protection with ultra-slim profile.',
    sizes: ['iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 15 Pro', 'Samsung S24 Ultra'],
    colors: ['Carbon Black', 'Matte Grey'],
    badge: 'BESTSELLER',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets_hero.png',
      '/images/gadgets-atmosphere.png',
    ],
  },
  {
    id: 'gadget-002',
    name: 'UltraClear 9H Matte Privacy Screen Guard',
    brand: 'Skplore Tech',
    category: 'gadgets',
    subcategory: 'screen-guards',
    gender: 'unisex',
    price: 599,
    originalPrice: 999,
    description: 'Electroplated anti-peep 9H tempered glass screen guard with 28-degree privacy filter, oleophobic anti-fingerprint coating, and bubble-free auto-alignment kit.',
    sizes: ['Universal', 'iPhone 16 Series', 'iPhone 15 Series', 'Samsung S24 Series'],
    colors: ['Matte Privacy', 'Clear HD'],
    badge: 'TRENDING',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets_hero.png',
      '/images/gadgets-atmosphere.png',
    ],
  },
  {
    id: 'gadget-003',
    name: 'AcousticStudio Hi-Res Wireless Sound System',
    brand: 'Skplore Audio',
    category: 'gadgets',
    subcategory: 'sound-systems',
    gender: 'unisex',
    price: 8999,
    originalPrice: 13999,
    description: 'Premium dual-driver bookshelf studio monitor speaker system with Bluetooth 5.3 aptX HD, optical and AUX inputs, wooden acoustical chamber, and room-filling 80W RMS output.',
    sizes: ['Standard'],
    colors: ['Matte Black', 'Walnut Wood'],
    badge: 'EXCLUSIVE',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets_hero.png',
      '/images/gadgets-atmosphere.png',
    ],
  },
  {
    id: 'gadget-004',
    name: 'MagPower 3-in-1 Fast Wireless Charging Dock',
    brand: 'Skplore Tech',
    category: 'gadgets',
    subcategory: 'smart-tech',
    gender: 'unisex',
    price: 2999,
    originalPrice: 4499,
    description: 'Precision machined aluminum folding charging stand for Phone, Smart Watch, and Wireless Earbuds simultaneously. 15W Qi-certified fast wireless charging.',
    sizes: ['One Size'],
    colors: ['Space Grey', 'Silver'],
    badge: 'NEW',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets-atmosphere.png',
      '/images/gadgets_hero.png',
    ],
  },
  {
    id: 'gadget-005',
    name: 'PulseX ANC Active Noise-Cancelling Earbuds',
    brand: 'Skplore Audio',
    category: 'gadgets',
    subcategory: 'sound-systems',
    gender: 'unisex',
    price: 3499,
    originalPrice: 5499,
    description: 'High-fidelity audio drivers with -42dB hybrid Active Noise Cancellation, transparency mode, 40-hour battery life with wireless charging case, and IPX5 sweat resistance.',
    sizes: ['One Size'],
    colors: ['Midnight Black', 'Pearl White'],
    badge: 'BESTSELLER',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets-atmosphere.png',
      '/images/gadgets_hero.png',
    ],
  },
  {
    id: 'gadget-006',
    name: 'AeroFlex 100W Braided Fast-Charging Cable (2M)',
    brand: 'Skplore Tech',
    category: 'gadgets',
    subcategory: 'chargers-cables',
    gender: 'unisex',
    price: 699,
    originalPrice: 1199,
    description: 'Ultra-durable Kevlar-reinforced braided Type-C to Type-C cable with real-time LED digital wattage display and 100W PD power delivery.',
    sizes: ['2 Meters'],
    colors: ['Black/Grey'],
    badge: 'TRENDING',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets_hero.png',
      '/images/gadgets-atmosphere.png',
    ],
  },
  {
    id: 'gadget-007',
    name: 'CyberGrip Magnetic Ring Stand & Card Wallet',
    brand: 'Skplore Tech',
    category: 'gadgets',
    subcategory: 'unique-accessories',
    gender: 'unisex',
    price: 899,
    originalPrice: 1499,
    description: 'Sleek MagSafe vegan leather wallet and 360-degree rotating zinc alloy grip stand holding up to 3 cards securely with RFID shielding.',
    sizes: ['Universal MagSafe'],
    colors: ['Black', 'Navy', 'Saddle Brown'],
    badge: 'NEW',
    atmosphere: 'gadgets',
    images: [
      '/images/gadgets-atmosphere.png',
      '/images/gadgets_hero.png',
    ],
  },
`;

// Insert before closing bracket of products array
content = content.replace(/\n\];\s*\n\s*\/\/\s*═+\s*\n\/\/\s*QUERY HELPERS/m, extraProducts + "\n];\n\n// ═══════════════════════════════════════════\n// QUERY HELPERS");

// Add helper query functions for Fashion and Gadgets
const extraHelpers = `
export function getFashionByGender(gender) {
  const g = (gender || '').toLowerCase();
  return products.filter(p => 
    (p.category === 'clothing' || p.category === 'footwear' || p.category === 'accessories') &&
    (p.gender === g || (g === 'women' && p.gender === 'women') || (g === 'men' && p.gender === 'men') || p.gender === 'unisex')
  );
}

export function getGadgetsProducts() {
  return products.filter(p => p.category === 'gadgets');
}

export function getGadgetsBySubcategory(subcategory) {
  if (!subcategory || subcategory === 'all') return getGadgetsProducts();
  return products.filter(p => p.category === 'gadgets' && p.subcategory === subcategory);
}
`;

content = content + "\n" + extraHelpers;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched products.js!');
