import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://YOUR_SKPLORE_DOMAIN.com';

// Regenerate sitemap at most once per day — prevents repeated DB calls on every crawl
export const revalidate = 86400;

export default async function sitemap() {
  // Static pages — always returned even if DB is down
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/fashion`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/fashion/men`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/fashion/women`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/gadgets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/clothing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/footwear`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/accessories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Dynamic product pages — uses public anon key (always available) with a 5s timeout
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
      .select('id, created_at')
      .eq('is_active', true)
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    productPages = (products || []).map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (e) {
    // If DB is unreachable or times out, still return static pages
  }

  return [...staticPages, ...productPages];
}

