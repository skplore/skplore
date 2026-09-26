import './globals.css';
import dynamic from 'next/dynamic';
import { CartProvider } from '@/context/CartContext';
import { AtmosphereProvider } from '@/context/AtmosphereContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { Analytics } from '@vercel/analytics/next';

// Lazy-load heavy components — still SSR but code-split into separate chunks
const CartDrawer = dynamic(() => import('@/components/CartDrawer'));

export const metadata = {
  title: 'Skplore | Premium Multi-Brand E-Commerce Store',
  description:
    'Shop the latest premium clothing, footwear, and accessories at Skplore. Discover exclusive trends and top-tier styles with nationwide delivery.',
  keywords: 'Skplore, premium fashion, clothing, footwear, accessories, e-commerce, nationwide delivery',
  icons: {
    icon: '/products/logo/skplore-logo.jpg',
    shortcut: '/products/logo/skplore-logo.jpg',
    apple: '/products/logo/skplore-logo.jpg',
  },
  openGraph: {
    title: 'Skplore | Premium Multi-Brand E-Commerce Store',
    description:
      'Shop the latest premium clothing, footwear, and accessories at Skplore. Discover exclusive trends and top-tier styles with nationwide delivery.',
    type: 'website',
    url: 'https://YOUR_SKPLORE_DOMAIN.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          <AtmosphereProvider>
            <Header />
            <CartDrawer />
            <main className="page-content">
              <h1 className="sr-only">Skplore E-Commerce Store</h1>
              {children}
            </main>
            <Footer />
            <WhatsAppWidget />
            <Analytics />
          </AtmosphereProvider>
        </CartProvider>
      </body>
    </html>
  );
}
