import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/**
 * Optimize image URLs with transformation parameters.
 * Handles both Cloudinary URLs (native transforms) and legacy Supabase URLs.
 * @param {string} url - Original image URL
 * @param {number} width - Desired width in pixels
 * @returns {string} Optimized URL
 */
function optimizeImageUrl(url, width = 800) {
  if (!url) return url;

  // Cloudinary URLs: insert transformation params into the URL path
  // e.g. /upload/v123/ → /upload/c_limit,w_800,q_auto,f_auto/v123/
  if (url.includes('res.cloudinary.com')) {
    return url.replace(
      '/upload/',
      `/upload/c_limit,w_${width},q_auto,f_auto/`
    );
  }

  // Legacy Supabase Storage URLs
  if (url.includes('supabase.co')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('quality', '85');
    urlObj.searchParams.set('format', 'webp');
    return urlObj.toString();
  }

  return url;
}

import { fetchGadgetQuantities, getCachedGadgetQuantities } from '@/lib/gadgetQuantities';

/**
 * Shape a raw product row (with joined subcategories + images) into the
 * flat object shape the existing components expect.
 */
function shapeProduct(row, gadgetMeta = {}) {
  const sortedImages = (row.product_images || [])
    .sort((a, b) => a.display_order - b.display_order);

  const images = sortedImages.map((img) => optimizeImageUrl(img.image_url, 800));

  // Build colorImages: { 'Black': 1, 'Navy': 2, ... }
  // Maps colour name -> index in the images[] array.
  // Images with no color_tag are cover/generic photos (index 0 by default).
  const colorImages = {};
  sortedImages.forEach((img, idx) => {
    if (img.color_tag) {
      // If a colour appears multiple times, keep the first (lowest display_order)
      if (colorImages[img.color_tag] === undefined) {
        colorImages[img.color_tag] = idx;
      }
    }
  });

  const category = row.subcategories?.categories?.slug || row.subcategories?.categories?.name?.toLowerCase() || '';
  const quantities = (gadgetMeta && Object.keys(gadgetMeta).length > 0)
    ? gadgetMeta
    : getCachedGadgetQuantities();
  const meta = (quantities && quantities[row.id]) || {};

  const minOrderQuantity = (row.min_order_quantity !== undefined && row.min_order_quantity !== null)
    ? Math.max(1, parseInt(row.min_order_quantity, 10))
    : (meta.minOrderQuantity ? Math.max(1, parseInt(meta.minOrderQuantity, 10)) : 1);

  const maxOrderQuantity = (row.max_order_quantity !== undefined && row.max_order_quantity !== null)
    ? parseInt(row.max_order_quantity, 10)
    : (meta.maxOrderQuantity ? parseInt(meta.maxOrderQuantity, 10) : null);

  const stockQuantity = (row.stock_quantity !== undefined && row.stock_quantity !== null && row.stock_quantity !== '')
    ? parseInt(row.stock_quantity, 10)
    : (meta.stockQuantity !== undefined && meta.stockQuantity !== null && meta.stockQuantity !== '' ? parseInt(meta.stockQuantity, 10) : null);

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    productCode: row.product_code || null,
    category,
    subcategory: row.subcategories?.slug || row.subcategories?.name?.toLowerCase() || '',
    gender: row.gender || undefined,
    price: row.price,
    originalPrice: row.original_price,
    description: row.description,
    sizes: row.sizes || [],
    colors: row.colors || [],
    badge: row.badge,
    atmosphere: row.atmosphere_theme || 'default',
    minOrderQuantity,
    maxOrderQuantity,
    stockQuantity,
    images,
    colorImages,  // { 'Black': 1, 'Navy': 2 } — colour → image index
  };
}

/** Full select — used for product detail page (needs description). */
const PRODUCT_SELECT = `
  id, name, brand, gender, price, original_price, description,
  sizes, colors, badge, atmosphere_theme, is_active, created_at, product_code,
  subcategories ( id, name, slug, categories ( id, name, slug ) ),
  product_images ( id, image_url, display_order, color_tag )
`;

/** Listing select — excludes description for lighter payloads. */
const LISTING_SELECT = `
  id, name, brand, gender, price, original_price, product_code,
  sizes, colors, badge, atmosphere_theme,
  subcategories ( id, name, slug, categories ( id, name, slug ) ),
  product_images ( id, image_url, display_order, color_tag )
`;

// ─── Query Functions (wrapped with React cache for request dedup) ───

import { 
  products as staticProducts, 
  getFashionByGender as getStaticFashionByGender,
  getGadgetsProducts as getStaticGadgetsProducts,
  getProductById as getStaticProductById,
  getFeaturedProducts as getStaticFeaturedProducts,
  getNewArrivals as getStaticNewArrivals,
  getProductsByCategory as getStaticProductsByCategory,
} from '@/data/products';

export const getProductsByCategory = cache(async (categorySlug) => {
  try {
    const supabase = await createClient();
    const gadgetQuantities = await fetchGadgetQuantities();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .eq('subcategories.categories.slug', categorySlug);

    const shaped = (data || [])
      .filter((p) => p.subcategories?.categories?.slug === categorySlug)
      .map((p) => shapeProduct(p, gadgetQuantities));

    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error in query:', err);
  }
  return getStaticProductsByCategory(categorySlug);
});

export const getProductsBySubcategory = cache(async (categorySlug, subcategorySlug) => {
  try {
    const supabase = await createClient();
    const gadgetQuantities = await fetchGadgetQuantities();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .eq('subcategories.slug', subcategorySlug)
      .eq('subcategories.categories.slug', categorySlug);

    const shaped = (data || [])
      .filter(
        (p) =>
          p.subcategories?.categories?.slug === categorySlug &&
          p.subcategories?.slug === subcategorySlug
      )
      .map((p) => shapeProduct(p, gadgetQuantities));

    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching products by subcategory:', err);
  }
  return staticProducts.filter(p => p.category === categorySlug && p.subcategory === subcategorySlug);
});

export const getProductsByGender = cache(async (gender) => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .or(`gender.eq.${gender},gender.eq.unisex`);

    const shaped = (data || []).map(shapeProduct);
    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching products by gender:', err);
  }
  return staticProducts.filter(p => p.gender === gender || p.gender === 'unisex');
});

export const getFashionByGender = cache(async (gender) => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .or(`gender.eq.${gender},gender.eq.unisex`);

    const shaped = (data || [])
      .filter(p => ['clothing', 'footwear', 'accessories'].includes(p.subcategories?.categories?.slug))
      .map(shapeProduct);

    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching fashion by gender:', err);
  }
  return getStaticFashionByGender(gender);
});

export const getGadgetsProducts = cache(async () => {
  try {
    const supabase = await createClient();
    const gadgetQuantities = await fetchGadgetQuantities();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .eq('subcategories.categories.slug', 'gadgets');

    const shaped = (data || [])
      .filter((p) => p.subcategories?.categories?.slug === 'gadgets')
      .map((p) => shapeProduct(p, gadgetQuantities));

    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching gadgets products:', err);
  }
  return getStaticGadgetsProducts();
});

export const getFootwearByGender = cache(async (gender) => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .eq('gender', gender)
      .eq('subcategories.categories.slug', 'footwear');

    const shaped = (data || [])
      .filter((p) => p.subcategories?.categories?.slug === 'footwear')
      .map(shapeProduct);

    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching footwear by gender:', err);
  }
  return staticProducts.filter(p => p.category === 'footwear' && p.gender === gender);
});

export const getProductById = cache(async (id) => {
  try {
    const supabase = await createClient();
    const gadgetQuantities = await fetchGadgetQuantities();
    const { data } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .single();

    if (data) return shapeProduct(data, gadgetQuantities);
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching product by id:', err);
  }
  return getStaticProductById(id) || null;
});

export const getFeaturedProducts = cache(async () => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .in('badge', ['BESTSELLER', 'TRENDING']);

    const shaped = (data || []).map(shapeProduct);
    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching featured products:', err);
  }
  return getStaticFeaturedProducts();
});

export const getNewArrivals = cache(async () => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select(LISTING_SELECT)
      .eq('is_active', true)
      .in('badge', ['NEW', 'EXCLUSIVE']);

    const shaped = (data || []).map(shapeProduct);
    if (shaped.length > 0) return shaped;
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Error fetching new arrivals:', err);
  }
  return getStaticNewArrivals();
});

export const getRelatedProducts = cache(async (productId, categorySlug, limit = 4) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select(LISTING_SELECT)
    .eq('is_active', true)
    .eq('subcategories.categories.slug', categorySlug)
    .neq('id', productId)
    .limit(limit * 2); // Fetch a small buffer to account for Supabase nested-filter quirk

  return (data || [])
    .filter((p) => p.subcategories?.categories?.slug === categorySlug)
    .slice(0, limit)
    .map(shapeProduct);
});

export const getCategories = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('name');

  return data || [];
});

export const getSubcategories = cache(async (categorySlug) => {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!cat) return [];

  const { data } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', cat.id)
    .order('name');

  return data || [];
});

export const getAccessoriesGrouped = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select(LISTING_SELECT)
    .eq('is_active', true)
    .eq('subcategories.categories.slug', 'accessories');

  const accessories = (data || [])
    .filter((p) => p.subcategories?.categories?.slug === 'accessories')
    .map(shapeProduct);

  return {
    menWatches: accessories.filter(p => p.subcategory === 'watches' && p.gender === 'men'),
    womenWatches: accessories.filter(p => p.subcategory === 'watches' && p.gender === 'women'),
    bags: accessories.filter(p => p.subcategory === 'bags'),
  };
});
