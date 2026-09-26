/**
 * Skplore — Dynamic Category Discount Configuration & Utilities
 *
 * Discounts are dynamically managed from the Admin Dashboard (/discounts)
 * and persisted in Supabase Storage (store-config/discounts.json).
 */

export const DEFAULT_DISCOUNT_PERCENTAGES = {
  clothing: 10,
  footwear: 10,
  accessories: 10,
  gadgets: 15,
};

export const DEFAULT_DISCOUNT_RATES = {
  clothing: 0.10,
  footwear: 0.10,
  accessories: 0.10,
  gadgets: 0.15,
};

const DISCOUNTS_PUBLIC_URL =
  'https://skimedlufkytgemmdhsv.supabase.co/storage/v1/object/public/store-config/discounts.json';

/**
 * Fetch dynamic discount percentages from Supabase Storage with caching & fallback.
 */
export async function fetchDynamicDiscountPercentages() {
  try {
    const res = await fetch(DISCOUNTS_PUBLIC_URL, {
      next: { revalidate: 30 }, // fresh within 30 seconds
    });
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_DISCOUNT_PERCENTAGES, ...data };
    }
  } catch (err) {
    // Graceful fallback to defaults
  }
  return DEFAULT_DISCOUNT_PERCENTAGES;
}

/**
 * Convert percentage object ({ clothing: 15 }) to decimal rates ({ clothing: 0.15 }).
 */
export function toDecimalRates(percentages = DEFAULT_DISCOUNT_PERCENTAGES) {
  const rates = {};
  for (const [key, val] of Object.entries(percentages)) {
    const num = Number(val) || 0;
    rates[key] = num > 0 ? num / 100 : 0;
  }
  return rates;
}

/**
 * Returns the discount rate (0–1) for a given category & rates map.
 */
export function getDiscountRate(category, rates = DEFAULT_DISCOUNT_RATES) {
  if (!category) return 0;
  const key = category.toLowerCase();
  return rates[key] ?? DEFAULT_DISCOUNT_RATES[key] ?? 0;
}

/**
 * Returns discounted price for single item.
 */
export function applyDiscount(price, category, rates) {
  const rate = getDiscountRate(category, rates);
  return price * (1 - rate);
}

/**
 * Computes full cart totals with per-category breakdowns dynamically.
 */
export function computeCartTotals(items, customRates = null) {
  const rates = customRates || DEFAULT_DISCOUNT_RATES;
  let originalTotal = 0;
  const savingsByCategory = {};

  const itemBreakdown = items.map((item) => {
    const rate = getDiscountRate(item.category, rates);
    const originalLineTotal = item.price * item.quantity;
    const discountedLineTotal = rate > 0 ? originalLineTotal * (1 - rate) : originalLineTotal;
    const saving = originalLineTotal - discountedLineTotal;

    originalTotal += originalLineTotal;

    const catKey = (item.category || 'other').toLowerCase();
    if (saving > 0) {
      savingsByCategory[catKey] = (savingsByCategory[catKey] || 0) + saving;
    }

    return {
      ...item,
      rate,
      originalLineTotal,
      discountedLineTotal,
      saving,
    };
  });

  const totalSavings = Object.values(savingsByCategory).reduce((a, b) => a + b, 0);
  const finalTotal = Math.max(0, originalTotal - totalSavings);

  return {
    originalTotal,
    savingsByCategory,
    totalSavings,
    finalTotal,
    itemBreakdown,
  };
}

/**
 * Builds the WhatsApp message body for order confirmation.
 */
export function buildWhatsAppMessage(itemBreakdown, totals, customRates = null, customer = null) {
  const rates = customRates || DEFAULT_DISCOUNT_RATES;
  const fmt = (n) => n.toLocaleString('en-IN');

  const lines = ['🛍️ *NEW ORDER — Skplore*', ''];

  if (customer && customer.name) {
    lines.push(
      '👤 *CUSTOMER & DELIVERY DETAILS*',
      `Name: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Address: ${customer.address}`,
      `PIN Code: ${customer.pincode}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '📦 *ORDER ITEMS*',
      ''
    );
  }

  itemBreakdown.forEach((item, idx) => {
    const discount =
      item.rate > 0
        ? ` → After ${Math.round(item.rate * 100)}% OFF: ₹${fmt(Math.round(item.discountedLineTotal))}`
        : '';
    const codeTag = item.productCode ? ` [${item.productCode}]` : '';
    lines.push(
      `${idx + 1}. *${item.name}*${codeTag}`,
      `   Size: ${item.size || 'N/A'} | Colour: ${item.color || 'N/A'} | Qty: ${item.quantity}`,
      `   Price: ₹${fmt(item.price)} × ${item.quantity} = ₹${fmt(item.originalLineTotal)}${discount}`,
      '',
    );
  });

  lines.push('━━━━━━━━━━━━━━━━━━━━');

  // Dynamic Category savings
  for (const [cat, saving] of Object.entries(totals.savingsByCategory)) {
    if (saving > 0) {
      const pct = Math.round((rates[cat] || 0) * 100);
      const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
      lines.push(`${catName} (${pct}% off) saved: −₹${fmt(Math.round(saving))}`);
    }
  }

  lines.push(
    `Original Total : ₹${fmt(Math.round(totals.originalTotal))}`,
    `Total Savings  : −₹${fmt(Math.round(totals.totalSavings))}`,
    `*FINAL TOTAL   : ₹${fmt(Math.round(totals.finalTotal))}*`,
    '━━━━━━━━━━━━━━━━━━━━',
    'Please confirm availability & shipping details. Thank you! 🙏',
  );

  return lines.join('\n');
}

/**
 * Builds dynamic promo banner ticker items based on active percentages.
 * Excludes categories where discount is 0 (None).
 */
export function getDiscountBannerItems(percentages = DEFAULT_DISCOUNT_PERCENTAGES) {
  const items = [];

  const config = [
    { key: 'clothing', emoji: '🎽', label: 'FASHION', desc: 'Off Men & Women Collections', color: '#C41230' },
    { key: 'footwear', emoji: '👟', label: 'FOOTWEAR', desc: 'Off All Luxury Footwear', color: '#B8860B' },
    { key: 'accessories', emoji: '🕶️', label: 'ACCESSORIES', desc: 'Off Luxury Bags & Watches', color: '#7C3AED' },
    { key: 'gadgets', emoji: '📱', label: 'GADGETS', desc: 'Off Phone Cases & Audio Tech', color: '#0D9488' },
  ];

  config.forEach(({ key, emoji, label, desc, color }) => {
    const pct = percentages[key] ?? 0;
    if (pct > 0) {
      items.push({
        emoji,
        label,
        pct: `${pct}% OFF`,
        desc,
        color,
      });
    }
  });

  // If no category discounts are active (all set to None), show general brand announcement
  if (items.length === 0) {
    return [
      { emoji: '✨', label: 'SKPLORE', pct: 'EST. HYDERABAD', desc: 'Curated Fashion, Footwear & Tech Accessories', color: '#7C3AED' },
      { emoji: '⚡', label: 'EXPRESS DELIVERY', pct: 'ALL INDIA', desc: 'Complimentary Shipping On All Prepaid Orders', color: '#B8860B' },
    ];
  }

  return items;
}
