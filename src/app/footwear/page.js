import FootwearClient from './FootwearClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const metadata = {
  title: 'Designer Footwear & Luxury Sneakers Hyderabad | Men & Women | Skplore',
  description:
    'Discover curated men and women designer sneakers, casual shoes, and athletic footwear in Hyderabad at Skplore Banjara Hills. Same-day local delivery.',
  keywords: [
    'footwear Hyderabad',
    'sneakers Hyderabad',
    'men footwear Hyderabad',
    'women sneakers Hyderabad',
    'designer shoes Banjara Hills',
    'luxury footwear Hyderabad',
    'Skplore footwear',
  ].join(', '),
  alternates: {
    canonical: `${BASE_URL}/footwear`,
  },
  openGraph: {
    title: 'Designer Footwear & Luxury Sneakers Hyderabad | Skplore',
    description:
      'Curated men and women luxury sneakers, casual shoes, and athletic kicks at Skplore Banjara Hills, Hyderabad.',
    url: `${BASE_URL}/footwear`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Designer Footwear & Luxury Sneakers Hyderabad | Skplore',
    description:
      'Curated men and women luxury sneakers, casual shoes, and athletic kicks at Skplore Banjara Hills, Hyderabad.',
  },
};

export default function FootwearPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Designer Footwear & Luxury Sneakers Hyderabad | Skplore',
    description: 'Curated men and women luxury sneakers and casual footwear in Hyderabad.',
    url: `${BASE_URL}/footwear`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <FootwearClient />
    </>
  );
}
