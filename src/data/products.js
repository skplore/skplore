/**
 * Products Data Store
 * All product records are now migrated and stored dynamically in the Supabase PostgreSQL database.
 * The static products array has been emptied so that all data is fetched live and dynamically from Supabase.
 */

export const products = [];

// ═══════════════════════════════════════════
// QUERY HELPERS (Fallback interfaces)
// ═══════════════════════════════════════════

export function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

export function getProductsBySubcategory(category, subcategory) {
  return products.filter(p => p.category === category && p.subcategory === subcategory);
}

export function getProductsByGender(gender) {
  return products.filter(p => p.gender === gender);
}

export function getProductById(id) {
  return products.find(p => p.id === id);
}

export function getFeaturedProducts() {
  return products.filter(p => p.badge === 'BESTSELLER' || p.badge === 'TRENDING');
}

export function getNewArrivals() {
  return products.filter(p => p.badge === 'NEW' || p.badge === 'EXCLUSIVE');
}

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
