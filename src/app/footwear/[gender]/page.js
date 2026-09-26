import { getFootwearByGender, getSubcategories } from '@/lib/queries';
import FootwearGenderClient from './FootwearGenderClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const revalidate = 1800; // Revalidate every 30 minutes

export async function generateMetadata({ params }) {
  const { gender } = await params;
  const isMen = gender === 'men';
  const title = isMen
    ? "Men's Luxury Footwear & Sneakers Hyderabad | Skplore"
    : "Women's Luxury Footwear & Shoes Hyderabad | Skplore";
  const description = isMen
    ? "Explore Skplore's curated collection of men's casual kicks, funky sneakers, and sports footwear in Hyderabad at Banjara Hills Road No. 12."
    : "Explore Skplore's curated collection of women's sneakers, casual shoes, and designer footwear in Hyderabad at Banjara Hills Road No. 12.";

  return {
    title,
    description,
    keywords: [
      `${gender} footwear Hyderabad`,
      `${gender} sneakers Hyderabad`,
      `designer ${gender} shoes Banjara Hills`,
      'Skplore footwear',
    ].join(', '),
    alternates: {
      canonical: `${BASE_URL}/footwear/${gender}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/footwear/${gender}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function FootwearGenderPage({ params }) {
  const { gender } = await params;

  const [products, subcategories] = await Promise.all([
    getFootwearByGender(gender),
    getSubcategories('footwear'),
  ]);

  // Build tabs from subcategories relevant to this gender
  const relevantSubs = [...new Set(products.map(p => p.subcategory))];
  const tabs = [
    { key: 'all', label: 'All' },
    ...subcategories
      .filter(s => relevantSubs.includes(s.slug))
      .map(s => ({ key: s.slug, label: s.name })),
  ];

  return <FootwearGenderClient products={products} tabs={tabs} gender={gender} />;
}

