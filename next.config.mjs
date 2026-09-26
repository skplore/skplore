/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow LAN access for mobile testing
  allowedDevOrigins: ['192.168.0.109'],

  // Image optimization — offloaded to browser pre-compression and R2 static serving
  images: {
    unoptimized: true, // Crucial: stops Vercel from using its 1000-image free tier quota
    qualities: [75, 85],
    imageSizes: [128, 256, 384],
    deviceSizes: [640, 768, 1024, 1280],
    remotePatterns: [
      {
        // Cloudflare R2 Public Domain
        protocol: 'https',
        hostname: 'pub-147b6454958c46f3bfb564286d54ecf9.r2.dev',
      },
      {
        // Your Skplore image CDN (set this after creating your Cloudflare R2 bucket)
        protocol: 'https',
        hostname: 'images.YOUR_SKPLORE_DOMAIN.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // Skplore Supabase project hostname
        protocol: 'https',
        hostname: 'skimedlufkytgemmdhsv.supabase.co',
      },
    ],
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Performance + CDN caching headers — keeps serverless function invocations low
  async headers() {
    return [
      // Category listing pages — CDN caches for 10 min, revalidates in background for 30 min
      {
        source: '/(clothing|footwear|accessories)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=1800',
          },
        ],
      },
      // Footwear gender sub-pages
      {
        source: '/footwear/:gender(men|women)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=1800',
          },
        ],
      },
      // Product detail pages — CDN caches for 30 min, revalidates in background for 2 hrs
      {
        source: '/product/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=7200',
          },
        ],
      },
      // Public images — 1 year immutable
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Product images served from /products/
      {
        source: '/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
