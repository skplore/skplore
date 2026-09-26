/**
 * Gadget Quantities & Stock Limits Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides dynamic ordering limits (minimum order quantity, upper limit/max
 * order quantity, and total stock quantity) for gadgets.
 * 
 * Works with dual-layer architecture:
 * 1. Primary: native PostgreSQL columns (min_order_quantity, max_order_quantity, stock_quantity)
 * 2. Automatic Fallback: Supabase Storage store-config/gadget_quantities.json
 */

import { createClient } from '@supabase/supabase-js';

let cachedQuantities = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 1000; // 3 seconds fast cache for immediate dynamic updates

export function getCachedGadgetQuantities() {
  return cachedQuantities || {};
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Fetch dynamic gadget quantity map from Supabase Storage or cache.
 * Returns an object keyed by productId:
 * {
 *   [productId]: { minOrderQuantity: 3, maxOrderQuantity: 10, stockQuantity: 50 }
 * }
 */
export async function fetchGadgetQuantities(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedQuantities && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedQuantities;
  }

  // 1. Direct fetch from public storage CDN with cache busting
  try {
    const sUrl = `https://skimedlufkytgemmdhsv.supabase.co/storage/v1/object/public/store-config/gadget_quantities.json?t=${now}`;
    const res = await fetch(sUrl, { cache: 'no-store' });
    if (res.ok) {
      cachedQuantities = await res.json();
      lastFetchTime = now;
      return cachedQuantities;
    }
  } catch (e) {}

  // 2. Direct supabase client fallback
  const supabase = getSupabaseClient();
  if (!supabase) return cachedQuantities || {};

  try {
    const { data, error } = await supabase.storage
      .from('store-config')
      .download('gadget_quantities.json');

    if (!error && data) {
      const text = await data.text();
      cachedQuantities = JSON.parse(text);
      lastFetchTime = now;
      return cachedQuantities;
    }
  } catch (err) {
    console.error('Error fetching gadget quantities config:', err);
  }

  return cachedQuantities || {};
}

/**
 * Compute the effective limits for a given product or cart item.
 */
export function getProductQuantityLimits(product) {
  const minQuantity = Math.max(1, parseInt(product?.minOrderQuantity, 10) || 1);
  const maxOrderQuantity = product?.maxOrderQuantity ? parseInt(product.maxOrderQuantity, 10) : null;
  const stockQuantity = (product?.stockQuantity !== null && product?.stockQuantity !== undefined && product?.stockQuantity !== '') 
    ? parseInt(product.stockQuantity, 10) 
    : null;

  let upperLimit = null;
  if (maxOrderQuantity !== null && stockQuantity !== null) {
    upperLimit = Math.min(maxOrderQuantity, stockQuantity);
  } else if (maxOrderQuantity !== null) {
    upperLimit = maxOrderQuantity;
  } else if (stockQuantity !== null) {
    upperLimit = stockQuantity;
  }

  return {
    minQuantity,
    maxOrderQuantity,
    stockQuantity,
    upperLimit,
    isConstrained: minQuantity > 1 || upperLimit !== null,
  };
}
