import { getProductById, getRelatedProducts } from '@/lib/queries';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 7200; // Revalidate every 2 hours
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  return products?.map((product) => ({
    id: product.id,
  })) || [];
}


export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found | Skplore",
      description: 'The product you are looking for does not exist.',
    };
  }

  const title = `${product.name} by ${product.brand} | Skplore`;
  const description = product.description
    || `Shop ${product.name} by ${product.brand} at ₹${product.price.toLocaleString()}. Premium ${product.category} available at Skplore, Hyderabad's premier lifestyle destination.`;
  const image = product.images?.[0] || '/products/logo/skplorelogo.jpg';

  return {
    title,
    description,
    keywords: `${product.name}, ${product.brand}, ${product.category}, Skplore, Hyderabad fashion, Hyderabad gadgets`,
    openGraph: {
      title: `${product.name} — ${product.brand}`,
      description,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${product.brand}`,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
