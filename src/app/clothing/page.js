import { getProductsByCategory, getSubcategories } from '@/lib/queries';
import ClothingClient from './ClothingClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const revalidate = 7200; // Revalidate every 2 hours — reduces ISR writes

export const metadata = {
  title: 'Designer Clothing & Luxury Streetwear Hyderabad | Men & Women | Skplore',
  description:
    'Shop curated men and women designer clothing in Hyderabad at Skplore Banjara Hills. Premium luxury streetwear, designer shirts, oversized tees, jackets, and trendy fashion.',
  keywords: [
    'clothing store Hyderabad',
    'designer clothing Banjara Hills',
    'luxury streetwear Hyderabad',
    'men clothing store Hyderabad',
    'women fashion Hyderabad',
    'oversized t-shirts Hyderabad',
    'premium shirts Hyderabad',
    'Skplore clothing',
  ].join(', '),
  alternates: {
    canonical: `${BASE_URL}/clothing`,
  },
  openGraph: {
    title: 'Designer Clothing & Luxury Streetwear Hyderabad | Skplore',
    description:
      'Curated men and women luxury streetwear, designer shirts, and apparel at Skplore Banjara Hills Road No. 12, Hyderabad.',
    url: `${BASE_URL}/clothing`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/fashion_atmosphere_v2.jpg`,
        width: 1200,
        height: 630,
        alt: 'Skplore Designer Clothing Hyderabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Designer Clothing & Luxury Streetwear Hyderabad | Skplore',
    description:
      'Curated men and women luxury streetwear, designer shirts, and apparel at Skplore Banjara Hills Road No. 12, Hyderabad.',
    images: [`${BASE_URL}/images/fashion_atmosphere_v2.jpg`],
  },
};

export default async function ClothingPage() {
  const [allProducts, subcategories] = await Promise.all([
    getProductsByCategory('clothing'),
    getSubcategories('clothing'),
  ]);

  const tabs = [
    { key: 'all', label: 'All' },
    ...subcategories.map(s => ({ key: s.slug, label: s.name })),
  ];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Designer Clothing & Luxury Streetwear Hyderabad | Skplore',
    description: 'Curated men and women luxury clothing and designer streetwear in Hyderabad.',
    url: `${BASE_URL}/clothing`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (allProducts || []).slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${BASE_URL}/product/${product.id}`,
        name: product.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <ClothingClient allProducts={allProducts} tabs={tabs} />
    </>
  );
}

