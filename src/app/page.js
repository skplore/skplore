import { getFeaturedProducts, getNewArrivals } from '@/lib/queries';
import HomeClient from './HomeClient';

export const revalidate = 7200; // Revalidate every 2 hours — reduces ISR writes

export const metadata = {
  title: 'Skplore | Premium Gadgets, Electronics & Designer Fashion in Hyderabad',
  description:
    "Hyderabad's premier store for smart tech gadgets, audio systems, wireless charging gear, phone cases, screen guards, and luxury designer clothing. Visit our flagship store at Banjara Hills Road No. 12.",
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
  ]);

  return <HomeClient featured={featured} newArrivals={newArrivals} />;
}

