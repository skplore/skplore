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


const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found | Skplore Hyderabad',
      description: 'The product you are looking for is unavailable or does not exist at Skplore.',
    };
  }

  const isGadget = product.category === 'gadgets';
  const categoryLabel = isGadget ? 'Tech Gadget & Accessory' : product.category;
  const title = `${product.name} by ${product.brand} | Buy Online Hyderabad`;
  const description =
    product.description ||
    `Buy authentic ${product.name} by ${product.brand} online at ₹${product.price.toLocaleString('en-IN')} from Skplore Hyderabad. Premium ${categoryLabel} available with fast same-day delivery across Hyderabad and express nationwide shipping.`;

  const rawImage = product.images?.[0] || '/products/logo/skplore-logo.jpg';
  const imageUrl = rawImage.startsWith('http') ? rawImage : `${BASE_URL}${rawImage}`;

  const keywords = [
    product.name,
    product.brand,
    product.category,
    product.subcategory,
    `buy ${product.name} Hyderabad`,
    `${product.brand} ${product.category} Hyderabad`,
    isGadget ? 'gadgets store Hyderabad' : 'clothing store Hyderabad',
    'Skplore Banjara Hills',
    'Skplore online store',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} — ${product.brand} | Skplore Hyderabad`,
      description,
      type: 'website',
      url: `${BASE_URL}/product/${product.id}`,
      images: [
        {
          url: imageUrl,
          alt: `${product.name} - ${product.brand}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${product.brand} | Skplore Hyderabad`,
      description,
      images: [imageUrl],
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

  const rawImage = product.images?.[0] || '/products/logo/skplore-logo.jpg';
  const imageUrl = rawImage.startsWith('http') ? rawImage : `${BASE_URL}${rawImage}`;
  const allImages = (product.images || []).map((img) => (img.startsWith('http') ? img : `${BASE_URL}${img}`));
  if (allImages.length === 0) allImages.push(imageUrl);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: allImages,
    description: product.description || `${product.name} by ${product.brand} available at Skplore Hyderabad.`,
    sku: String(product.id),
    mpn: String(product.id),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Skplore',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Skplore',
        url: BASE_URL,
      },
    },
  };

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Collections',
        item: `${BASE_URL}/${product.category || 'gadgets'}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${BASE_URL}/product/${product.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
