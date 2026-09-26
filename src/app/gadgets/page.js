import { getGadgetsProducts } from '@/lib/queries';
import GadgetsClient from './GadgetsClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata = {
  title: 'Gadgets & Tech Accessories Hyderabad | Smart Watches, Audio & Chargers | Skplore',
  description:
    'Shop high-performance gadgets in Hyderabad at Skplore Banjara Hills. Explore smart watches, 100W fast chargers, wireless power banks, audiophile earphones, 9H screen guards & phone cases with same-day local delivery.',
  keywords: [
    'gadgets Hyderabad',
    'buy gadgets online Hyderabad',
    'smart watches Hyderabad',
    'wireless chargers Banjara Hills',
    '100W charging cables Hyderabad',
    'phone cases Hyderabad',
    '9H privacy screen guards',
    'audiophile sound systems Hyderabad',
    'bluetooth earphones and speakers',
    'tech accessories store Hyderabad',
    'Skplore gadgets',
  ].join(', '),
  alternates: {
    canonical: `${BASE_URL}/gadgets`,
  },
  openGraph: {
    title: 'Gadgets & Tech Accessories Hyderabad | Skplore',
    description:
      'Explore smart tech, fast wireless chargers, audiophile speakers, 9H screen guards, and phone cases in Hyderabad at Skplore.',
    url: `${BASE_URL}/gadgets`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/gadgets_world_v2.jpg`,
        width: 1200,
        height: 630,
        alt: 'Skplore Gadgets & Tech Accessories Hyderabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadgets & Tech Accessories Hyderabad | Skplore',
    description:
      'Explore smart tech, fast wireless chargers, audiophile speakers, 9H screen guards, and phone cases in Hyderabad at Skplore.',
    images: [`${BASE_URL}/images/gadgets_world_v2.jpg`],
  },
};

export default async function GadgetsPage() {
  const products = await getGadgetsProducts();

  const tabs = [
    { key: 'all', label: 'All Gadgets' },
    { key: 'phone-cases', label: 'Phone Cases' },
    { key: 'screen-guards', label: 'Screen Guards' },
    { key: 'sound-systems', label: 'Sound Systems & Audio' },
    { key: 'smart-tech', label: 'Smart Tech & Charging' },
    { key: 'unique-accessories', label: 'Unique Accessories' },
  ];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gadgets & Tech Accessories | Skplore Hyderabad',
    description:
      'Shop high-performance gadgets, wireless charging gear, screen guards, audio systems, and phone cases in Hyderabad.',
    url: `${BASE_URL}/gadgets`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 20).map((product, index) => ({
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
      <GadgetsClient products={products} tabs={tabs} />
    </>
  );
}

