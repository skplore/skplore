import ContactClient from './ContactClient';

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://skplore.com';

export const metadata = {
  title: 'Visit Our Store in Banjara Hills, Hyderabad | Contact Skplore',
  description:
    'Visit Skplore flagship store at Banjara Hills Road No. 12, Hyderabad. Discover cutting-edge gadgets, phone accessories, and luxury fashion in person. Call or WhatsApp +91 77319 62101.',
  keywords: [
    'Skplore Hyderabad store',
    'Skplore Banjara Hills Road 12',
    'contact Skplore Hyderabad',
    'gadget store near me Banjara Hills',
    'clothing store Banjara Hills',
    'Skplore phone number',
    'Skplore WhatsApp',
  ].join(', '),
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: 'Visit Our Store in Banjara Hills, Hyderabad | Contact Skplore',
    description:
      'Visit Skplore flagship store at Banjara Hills Road No. 12, Hyderabad. Call or WhatsApp +91 77319 62101.',
    url: `${BASE_URL}/contact`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/contact_hero_v2.jpg`,
        width: 1200,
        height: 630,
        alt: 'Visit Skplore Store Banjara Hills Hyderabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visit Our Store in Banjara Hills, Hyderabad | Contact Skplore',
    description:
      'Visit Skplore flagship store at Banjara Hills Road No. 12, Hyderabad. Call or WhatsApp +91 77319 62101.',
    images: [`${BASE_URL}/images/contact_hero_v2.jpg`],
  },
};

export default function ContactPage() {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Skplore Hyderabad',
    description: 'Get in touch with Skplore store at Banjara Hills, Hyderabad.',
    url: `${BASE_URL}/contact`,
    mainEntity: {
      '@type': ['ElectronicsStore', 'ClothingStore', 'LocalBusiness'],
      name: 'Skplore',
      telephone: '+91 77319 62101',
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
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
