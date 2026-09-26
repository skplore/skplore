import { getFashionByGender } from '@/lib/queries';
import FashionGenderClient from './FashionGenderClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const revalidate = 1800; // Revalidate every 30 minutes

export async function generateMetadata({ params }) {
  const { gender } = await params;
  const isMen = gender === 'men';
  const title = isMen
    ? "Men's Designer Fashion & Streetwear Hyderabad | Skplore"
    : "Women's Designer Fashion & Luxury Apparel Hyderabad | Skplore";
  const desc = isMen
    ? "Explore Skplore's curated collection of men's designer clothing, footwear, and luxury accessories in Hyderabad at Banjara Hills Road No. 12."
    : "Explore Skplore's curated collection of women's designer clothing, footwear, and luxury accessories in Hyderabad at Banjara Hills Road No. 12.";

  return {
    title,
    description: desc,
    keywords: [
      `${gender} fashion Hyderabad`,
      `${gender} designer clothing Hyderabad`,
      `${gender} footwear Banjara Hills`,
      'Skplore Hyderabad',
    ].join(', '),
    alternates: {
      canonical: `${BASE_URL}/fashion/${gender}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `${BASE_URL}/fashion/${gender}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  };
}

export default async function FashionGenderPage({ params }) {
  const { gender } = await params;
  const products = await getFashionByGender(gender);

  const tabs = [
    { key: 'all', label: 'All Fashion' },
    { key: 'clothing', label: 'Clothing' },
    { key: 'footwear', label: 'Footwear' },
    { key: 'accessories', label: 'Accessories' },
  ];

  return <FashionGenderClient products={products} tabs={tabs} gender={gender} />;
}
