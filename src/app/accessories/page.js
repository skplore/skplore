import { getAccessoriesGrouped } from '@/lib/queries';
import AccessoriesClient from './AccessoriesClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const revalidate = 7200; // Revalidate every 2 hours — reduces ISR writes

export const metadata = {
  title: 'Luxury Watches, Leather Bags & Accessories Hyderabad | Skplore',
  description:
    'Discover curated luxury watches, genuine leather bags, wallets, and fashion accessories in Hyderabad at Skplore Banjara Hills. Same-day local delivery and pan-India shipping.',
  keywords: [
    'luxury watches Hyderabad',
    'designer bags Hyderabad',
    'men watches Banjara Hills',
    'women luxury watches Hyderabad',
    'leather bags and wallets',
    'fashion accessories Hyderabad',
    'Skplore accessories',
  ].join(', '),
  alternates: {
    canonical: `${BASE_URL}/accessories`,
  },
  openGraph: {
    title: 'Luxury Watches, Leather Bags & Accessories Hyderabad | Skplore',
    description:
      'Curated luxury watches, genuine leather bags, and lifestyle accessories at Skplore Banjara Hills, Hyderabad.',
    url: `${BASE_URL}/accessories`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Watches, Leather Bags & Accessories Hyderabad | Skplore',
    description:
      'Curated luxury watches, genuine leather bags, and lifestyle accessories at Skplore Banjara Hills, Hyderabad.',
  },
};

export default async function AccessoriesPage() {
  const { menWatches, womenWatches, bags } = await getAccessoriesGrouped();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Luxury Watches, Leather Bags & Accessories Hyderabad | Skplore',
    description: 'Curated luxury watches, genuine leather bags, and lifestyle accessories in Hyderabad.',
    url: `${BASE_URL}/accessories`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <AccessoriesClient
        menWatches={menWatches}
        womenWatches={womenWatches}
        bags={bags}
      />
    </>
  );
}

