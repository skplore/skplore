import FashionClient from './FashionClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const metadata = {
  title: 'Luxury Fashion Store Hyderabad | Men & Women Designer Collections | Skplore',
  description:
    "Discover Skplore's curated fashion world in Hyderabad. Explore premium clothing, luxury footwear, and designer accessories for men and women at Banjara Hills Road No. 12.",
  keywords: [
    'fashion store Hyderabad',
    'luxury fashion Banjara Hills',
    'men fashion Hyderabad',
    'women fashion Hyderabad',
    'designer clothing store Hyderabad',
    'Skplore fashion',
  ].join(', '),
  alternates: {
    canonical: `${BASE_URL}/fashion`,
  },
  openGraph: {
    title: 'Luxury Fashion Store Hyderabad | Skplore',
    description:
      'Curated clothing, footwear, and accessories for men and women at Skplore Banjara Hills, Hyderabad.',
    url: `${BASE_URL}/fashion`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Fashion Store Hyderabad | Skplore',
    description:
      'Curated clothing, footwear, and accessories for men and women at Skplore Banjara Hills, Hyderabad.',
  },
};

export default function FashionPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Luxury Fashion Store Hyderabad | Skplore',
    description: 'Curated clothing, footwear, and accessories for men and women in Hyderabad.',
    url: `${BASE_URL}/fashion`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <FashionClient />
    </>
  );
}
