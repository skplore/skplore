import { getGadgetsProducts } from '@/lib/queries';
import GadgetsClient from './GadgetsClient';

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata = {
  title: 'Gadgets & Tech Accessories | Skplore Hyderabad',
  description:
    'Discover premium phone cases, 9H privacy screen guards, audiophile sound systems, fast wireless charging gear, and unique tech accessories at Skplore.',
  keywords: 'phone cases, screen guards, sound systems, bluetooth speakers, chargers, tech accessories, Skplore Hyderabad',
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

  return <GadgetsClient products={products} tabs={tabs} />;
}
