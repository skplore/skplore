import { getFashionByGender } from '@/lib/queries';
import FashionGenderClient from './FashionGenderClient';

export const revalidate = 1800; // Revalidate every 30 minutes

export async function generateMetadata({ params }) {
  const { gender } = await params;
  const title = gender === 'men' ? "Men's Fashion | Skplore" : "Women's Fashion | Skplore";
  const desc = gender === 'men'
    ? "Explore Skplore's curated collection of men's clothing, footwear, and luxury accessories in Hyderabad."
    : "Explore Skplore's curated collection of women's clothing, footwear, and luxury accessories in Hyderabad.";

  return {
    title,
    description: desc,
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
