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

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Skplore | Premium Gadgets, Electronics & Luxury Fashion Store in Hyderabad',
    template: '%s | Skplore Hyderabad',
  },
  description:
    "Skplore is Hyderabad's premier destination for cutting-edge tech gadgets, smart accessories, audiophile sound gear, and curated luxury fashion. Visit our flagship store at Banjara Hills Road No. 12 or shop online with same-day Hyderabad delivery and nationwide shipping.",
  keywords: [
    // Brand & Local Keywords
    'Skplore',
    'Skplore Hyderabad',
    'Skplore store Banjara Hills',
    'shopping in Banjara Hills Road 12',
    'Hyderabad gadgets store',
    'electronics store near me Hyderabad',
    'tech accessories store Hyderabad',
    // Gadgets & Tech (Primary Focus)
    'gadgets Hyderabad',
    'buy gadgets online Hyderabad',
    'smart watches Hyderabad',
    'wireless chargers Hyderabad',
    '100W fast charging cables',
    'audiophile sound systems Hyderabad',
    'bluetooth earphones and headphones',
    'phone cases Hyderabad',
    '9H privacy screen guards',
    'MagSafe accessories',
    'smart tech accessories',
    // Clothing & Fashion
    'clothing store Hyderabad',
    'designer clothing Hyderabad',
    'men fashion store Hyderabad',
    'luxury streetwear Hyderabad',
    'oversized t-shirts Hyderabad',
    'premium shirts Banjara Hills',
    'women fashion Hyderabad',
    // Footwear & Accessories
    'luxury sneakers Hyderabad',
    'designer footwear Banjara Hills',
    'luxury watches Hyderabad',
    'leather bags and wallets',
  ].join(', '),
  authors: [{ name: 'Skplore', url: BASE_URL }],
  creator: 'Skplore',
  publisher: 'Skplore',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/products/logo/skplore-logo.jpg',
    shortcut: '/products/logo/skplore-logo.jpg',
    apple: '/products/logo/skplore-logo.jpg',
  },
  openGraph: {
    title: 'Skplore | Premium Gadgets, Electronics & Luxury Fashion — Hyderabad',
    description:
      "Shop cutting-edge gadgets, phone accessories, audiophile sound gear, and designer fashion in Hyderabad at Skplore. Flagship store at Banjara Hills Road No. 12.",
    url: BASE_URL,
    siteName: 'Skplore Hyderabad',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/products/logo/skplore-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Skplore - Hyderabad Gadgets & Fashion Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skplore | Hyderabad’s Premier Gadgets & Fashion Destination',
    description:
      'Curated smart gadgets, audio gear, phone cases, luxury streetwear & accessories in Hyderabad. Visit Banjara Hills Road No. 12.',
    images: ['/products/logo/skplore-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Skplore Hyderabad',
      description: "Hyderabad's premier store for cutting-edge gadgets, tech accessories, and designer fashion.",
      publisher: { '@id': `${BASE_URL}/#store` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/gadgets?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': ['ElectronicsStore', 'ClothingStore', 'LocalBusiness'],
      '@id': `${BASE_URL}/#store`,
      name: 'Skplore',
      image: `${BASE_URL}/products/logo/skplore-logo.jpg`,
      url: BASE_URL,
      telephone: '+91 77319 62101',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Banjara Hills, Road No. 12, Near City Center',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        postalCode: '500034',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 17.4156,
        longitude: 78.4357,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '10:00',
          closes: '22:00',
        },
      ],
      areaServed: [
        { '@type': 'City', name: 'Hyderabad' },
        { '@type': 'City', name: 'Secunderabad' },
        { '@type': 'AdministrativeArea', name: 'Telangana' },
        { '@type': 'Country', name: 'India' },
      ],
      sameAs: [
        'https://instagram.com/skplore_official',
        'https://wa.me/917731962101',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Skplore Curated Collections',
        itemListElement: [
          {
            '@type': 'OfferCatalog',
            name: 'Gadgets & Tech Accessories',
            description: 'Smart watches, wireless chargers, 100W cables, phone cases, 9H screen guards, audiophile sound systems',
          },
          {
            '@type': 'OfferCatalog',
            name: 'Designer Clothing & Luxury Streetwear',
            description: 'Premium shirts, t-shirts, jackets, ethnic and contemporary fashion for men and women',
          },
          {
            '@type': 'OfferCatalog',
            name: 'Footwear & Luxury Accessories',
            description: 'Casual & sports footwear, luxury watches, designer bags',
          },
        ],
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <CartProvider>
          <AtmosphereProvider>
            <Header />
            <CartDrawer />
            <main className="page-content">
              <h1 className="sr-only">Skplore — Premium Gadgets, Electronics &amp; Designer Clothing Store in Hyderabad</h1>
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
