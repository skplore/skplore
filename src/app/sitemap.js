import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

// Regenerate sitemap at most once per day — prevents repeated DB calls on every crawl
export const revalidate = 86400;

export default async function sitemap() {
  const now = new Date();

  // Static pages with search-intent prioritization (Gadgets & Storefront highest)
  const staticPages = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/gadgets`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/clothing`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/fashion`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/fashion/men`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/fashion/women`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/footwear`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/footwear/men`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/footwear/women`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/accessories`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Dynamic product pages — uses public anon key with a 5s timeout
  let productPages = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { data: products } = await supabase
      .from('products')
      .select('id, category, created_at, updated_at')
      .eq('is_active', true)
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    productPages = (products || []).map((product) => {
      const isGadget = product.category === 'gadgets';
      return {
        url: `${BASE_URL}/product/${product.id}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : product.created_at
          ? new Date(product.created_at)
          : now,
        changeFrequency: isGadget ? 'daily' : 'weekly',
        priority: isGadget ? 0.85 : 0.75,
      };
    });
  } catch (e) {
    // If DB is unreachable or times out, still return static pages
  }

  return [...staticPages, ...productPages];
}


