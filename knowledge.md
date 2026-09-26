# Brand 2 Brand — Complete Project Knowledge Base

> **Purpose**: This document is an exhaustive, interview-ready reference for every aspect of the Brand 2 Brand e-commerce platform. It covers architecture, technology choices (and why alternatives were rejected), database design, feature implementation, security, deployment, performance optimisation, and every other detail you might be asked about.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack — Detailed Breakdown](#2-tech-stack--detailed-breakdown)
3. [Why This Tech Stack? Alternatives Rejected](#3-why-this-tech-stack-alternatives-rejected)
4. [System Architecture](#4-system-architecture)
5. [Monorepo vs Separate Repos Strategy](#5-monorepo-vs-separate-repos-strategy)
6. [Database Design — Supabase / PostgreSQL](#6-database-design--supabase--postgresql)
7. [Data Flow — End to End](#7-data-flow--end-to-end)
8. [Image Storage & Optimisation Pipeline](#8-image-storage--optimisation-pipeline)
9. [Authentication & Security](#9-authentication--security)
10. [Customer-Facing Website — Feature Breakdown](#10-customer-facing-website--feature-breakdown)
11. [Admin Panel — Feature Breakdown](#11-admin-panel--feature-breakdown)
12. [Cart System & Discount Engine](#12-cart-system--discount-engine)
13. [WhatsApp Integration — Order Flow](#13-whatsapp-integration--order-flow)
14. [Atmosphere Theming System](#14-atmosphere-theming-system)
15. [Cinematic Intro Animation (VizagIntro)](#15-cinematic-intro-animation-vizagintro)
16. [SEO & Metadata Strategy](#16-seo--metadata-strategy)
17. [Performance Optimisation](#17-performance-optimisation)
18. [Caching Strategy — ISR, CDN, Headers](#18-caching-strategy--isr-cdn-headers)
19. [Responsive Design & Mobile-First Approach](#19-responsive-design--mobile-first-approach)
20. [CSS Architecture & Design System](#20-css-architecture--design-system)
21. [Component Architecture](#21-component-architecture)
22. [Routing Architecture](#22-routing-architecture)
23. [API Routes (Admin)](#23-api-routes-admin)
24. [Middleware / Proxy Layer](#24-middleware--proxy-layer)
25. [Error Handling & Edge Cases](#25-error-handling--edge-cases)
26. [Deployment Architecture](#26-deployment-architecture)
27. [Environment Variables & Configuration](#27-environment-variables--configuration)
28. [Migration & Data Seeding](#28-migration--data-seeding)
29. [Development Workflow & Precautions](#29-development-workflow--precautions)
30. [Accessibility (a11y)](#30-accessibility-a11y)
31. [File-by-File Reference](#31-file-by-file-reference)
32. [Interview FAQ — Quick Answers](#32-interview-faq--quick-answers)

---

## 1. Project Overview

### What is Brand 2 Brand?

Brand 2 Brand (also written as "Brand Two Brand" or "Brand 2 Brand's") is a **premium multi-brand e-commerce platform** for a physical retail store located in **Pedda Waltair, Visakhapatnam (Vizag), Andhra Pradesh, India**. The store sells men's clothing, footwear, and accessories (watches, bags).

### The Two Applications

The project consists of **two separate Next.js applications** that share the same Supabase database:

| Application | Purpose | Port | Deployment |
|---|---|---|---|
| **Brand2Brand** (Customer) | Public-facing e-commerce storefront | 3000 | Vercel |
| **Brand2Brand-Admin** | Private admin dashboard for store owner | 3001 | Vercel (separate project) |

### Business Model

- This is a **physical store with an online catalogue** — not a full e-commerce checkout system.
- There is **no payment gateway**. Instead, orders are placed via **WhatsApp**.
- The customer browses products, adds them to a cart, and the cart generates a formatted WhatsApp message sent directly to the store owner.
- The store owner then confirms availability, arranges shipping, and handles payment offline.

### Key Business Facts
- **Store Location**: Shivalayam Street, Pedda Waltair JN, Visakhapatnam – 530017
- **Owner Phone/WhatsApp**: +91 80745 48419
- **Instagram**: @brand2brands_official
- **Website Domain**: https://brand2brands.com
- **Product Categories**: Clothing (Shirts, Jeans, Hoodies, Kurthas), Footwear (Men's & Women's — Shoes, Slides, Sports, Casual), Accessories (Men's Watches, Women's Watches, Bags)

---

## 2. Tech Stack — Detailed Breakdown

### Frontend Framework: Next.js 16.2.1

- **Version**: 16.2.1 (latest at time of development)
- **React Version**: 19.2.4
- **React DOM**: 19.2.4
- **Rendering Strategy**: Hybrid — combines Server Components (RSC), Client Components, and Incremental Static Regeneration (ISR)
- **Router**: App Router (file-based routing under `src/app/`)

### Database: Supabase (PostgreSQL)

- **Supabase JS Client**: ^2.101.1
- **Supabase SSR**: ^0.10.0 (for server-side cookie-based auth)
- **Database Engine**: PostgreSQL (managed by Supabase)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (for legacy images; now migrated to Cloudinary)

### Image CDN: Cloudinary

- **Purpose**: Primary image hosting and transformation CDN
- **Integration**: Direct REST API (no SDK dependency — uses `crypto` for SHA-1 signatures)
- **Transformations**: On-the-fly resizing, quality auto-adjustment, format auto-detection (WebP/AVIF)

### Image Storage (Legacy/Alternative): Cloudflare R2

- **AWS SDK**: @aws-sdk/client-s3 ^3.1070.0, @aws-sdk/s3-request-presigner ^3.1070.0
- **Purpose**: Alternative/backup image storage with presigned URLs for direct browser uploads
- **Integration**: S3-compatible API via AWS SDK

### Animation Library: GSAP

- **Version**: ^3.14.2
- **Purpose**: Hero animations, cinematic intro sequence, page transitions
- **Why GSAP**: Professional-grade animation timeline control, physics-based easing, better performance than CSS animations for complex sequences

### Analytics

- **Vercel Analytics**: @vercel/analytics ^2.0.1
- **Vercel Speed Insights**: @vercel/speed-insights ^2.0.0

### Styling: Vanilla CSS

- **Approach**: Single monolithic `globals.css` file (3,189 lines, ~67KB) with CSS Custom Properties
- **Fonts**: Google Fonts — Bebas Neue (headings/logo), Playfair Display (subheadings), Montserrat (body)
- **No CSS framework** — intentional choice for maximum control

### Build Tool: Next.js built-in (Turbopack in dev)

### Linting: ESLint 9 with eslint-config-next

### Dev Dependencies
- **dotenv**: ^17.4.0 (for loading .env.local in scripts)
- **pg**: ^8.21.0 (PostgreSQL client for migration scripts)

---

## 3. Why This Tech Stack? Alternatives Rejected

### Why Next.js over React (CRA/Vite)?

| Criterion | Next.js (Chosen) | React + Vite | React (CRA) |
|---|---|---|---|
| **SSR/SSG** | Built-in | Requires manual setup | No SSR |
| **SEO** | Excellent (server-rendered HTML) | Poor (client-rendered) | Poor |
| **Image Optimization** | Built-in `<Image>` component | Manual | Manual |
| **Routing** | File-based, zero config | Manual react-router | Manual |
| **ISR** | Native support | Not available | Not available |
| **API Routes** | Built-in serverless functions | Requires separate backend | Requires separate backend |
| **Deployment** | Vercel-native | Manual | Manual |

**Decision**: Next.js was chosen because this is a **content-heavy e-commerce catalogue** where **SEO is critical** (product pages must be crawlable by Google). Server-side rendering and ISR give us the best of both worlds — fast initial loads AND dynamic content. CRA/Vite would require a separate backend and would have poor SEO without additional SSR setup.

### Why Not a Full E-commerce Platform (Shopify, WooCommerce)?

- **Cost**: Shopify charges monthly fees + transaction fees. This is a small physical store in Vizag.
- **Customisation**: The owner wanted a fully custom cinematic design with atmosphere theming — impossible with template-based platforms.
- **WhatsApp-first model**: No platform supports the WhatsApp-based ordering model natively.
- **Control**: Full ownership of code, data, and hosting.

### Why Supabase over Firebase?

| Criterion | Supabase (Chosen) | Firebase |
|---|---|---|
| **Database** | PostgreSQL (relational) | Firestore (NoSQL) |
| **Data Modeling** | Perfect for categories → subcategories → products (relational joins) | Would require denormalization |
| **Querying** | SQL-native, complex filters, nested joins | Limited querying, no JOINs |
| **Auth** | Built-in, JWT-based | Built-in, similar |
| **RLS** | PostgreSQL Row Level Security | Firebase Security Rules |
| **Open Source** | Yes | No |
| **Vendor Lock-in** | Low (standard PostgreSQL) | High |
| **Free Tier** | 500MB DB, 1GB storage, 2GB bandwidth | Similar but NoSQL limits |

**Decision**: The product data has clear **relational structure** (categories → subcategories → products → images). PostgreSQL with Supabase handles this naturally with foreign keys and JOINs. Firebase/Firestore would have forced denormalization and made queries like "get all accessories grouped by subcategory and gender" much harder.

### Why Not MongoDB?

- MongoDB is NoSQL — same denormalization issues as Firebase.
- No built-in auth, storage, or real-time — would need additional services.
- PostgreSQL's array columns (`TEXT[]` for sizes, colors) give us the best of both worlds.

### Why Vanilla CSS over Tailwind CSS?

| Criterion | Vanilla CSS (Chosen) | Tailwind CSS |
|---|---|---|
| **Design Control** | Complete — custom design tokens, complex animations | Utility-class constrained |
| **Complex Animations** | Easy with @keyframes, custom properties | Requires arbitrary values |
| **Atmosphere Theming** | Dynamic CSS Custom Properties on `:root` | Would need runtime class switching |
| **Bundle Size** | Only what's used (67KB raw) | Purged ~10KB but less control |
| **Learning Curve** | Standard CSS knowledge | Tailwind-specific class memorization |
| **Maintenance** | Single design system file | Classes scattered across components |

**Decision**: The design requires **dynamic atmosphere theming** where CSS variables change at runtime based on the current category page. This is elegantly handled with CSS Custom Properties on `:root`. Tailwind would require complex configuration and runtime class manipulation. The cinematic intro and complex hover effects are also much cleaner in vanilla CSS.

### Why GSAP over Framer Motion?

| Criterion | GSAP (Chosen) | Framer Motion |
|---|---|---|
| **Timeline Control** | First-class timeline API | Limited sequencing |
| **Performance** | GPU-optimized, frame-accurate | Good but heavier |
| **Audio Sync** | Easy with `call()` in timeline | Manual |
| **Bundle Size** | ~32KB (core) | ~98KB |
| **Complex Sequences** | 10-act cinematic intro with perfect timing | Would be very verbose |

**Decision**: The VizagIntro component has a **10-act cinematic sequence** with audio sync, particle effects, screen shake, and precise timing. GSAP's timeline API makes this manageable. Framer Motion would require significantly more code and wouldn't handle audio scheduling natively.

### Why Cloudinary over Supabase Storage?

| Criterion | Cloudinary (Current) | Supabase Storage (Legacy) |
|---|---|---|
| **Image Transformations** | On-the-fly resize, format, quality | Manual — no transforms |
| **CDN** | Global CDN included | Limited to Supabase region |
| **Free Tier** | 25GB storage, 25GB bandwidth/month | 1GB storage |
| **WebP/AVIF** | Auto format detection (`f_auto`) | Manual conversion needed |
| **Cost at Scale** | Pay-as-you-grow | Quickly hits limits |

**Decision**: Product images need to be served at different sizes (thumbnails, cards, detail views) and formats (WebP for modern browsers, JPEG fallback). Cloudinary handles this **at the URL level** — just add transformation params to the URL path. Supabase Storage has no transformation capabilities, requiring pre-processing.

### Why Not AWS S3 Directly?

- Cloudflare R2 **is** S3-compatible (we use AWS SDK for it), but R2 has **zero egress fees**.
- R2 is used as a secondary/backup option alongside Cloudinary.
- Direct S3 would incur egress charges that could grow with traffic.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS (Browser)                         │
└─────────────────┬──────────────────────────────┬───────────────┘
                  │                              │
         ┌────────▼────────┐            ┌────────▼────────┐
         │   brand2brands  │            │   admin.brand2  │
         │     .com        │            │   brands.com    │
         │  (Customer)     │            │   (Admin)       │
         │  Port 3000      │            │   Port 3001     │
         └────────┬────────┘            └────────┬────────┘
                  │                              │
         ┌────────▼────────┐            ┌────────▼────────┐
         │  Next.js 16     │            │  Next.js 16     │
         │  App Router     │            │  App Router     │
         │  RSC + ISR      │            │  RSC + Client   │
         │  No Auth        │            │  Supabase Auth  │
         └────────┬────────┘            └────────┬────────┘
                  │                              │
                  │    ┌──────────────────┐      │
                  └────►  Supabase        ◄──────┘
                       │  PostgreSQL DB   │
                       │  Auth Service    │
                       │  Storage (Legacy)│
                       └────────┬─────────┘
                                │
                  ┌─────────────┼──────────────┐
                  │             │              │
           ┌──────▼──────┐ ┌───▼───┐  ┌───────▼───────┐
           │ Cloudinary   │ │ R2    │  │ Supabase      │
           │ (Primary     │ │ (Alt  │  │ Storage       │
           │  Image CDN)  │ │ CDN)  │  │ (Legacy imgs) │
           └──────────────┘ └───────┘  └───────────────┘
```

### Data Flow Summary

1. **Customer browses**: Next.js Server Components fetch products from Supabase → render HTML → send to browser
2. **Admin adds product**: Browser → Admin API route → Supabase DB insert; Browser → Cloudinary direct upload → save URL to DB via API
3. **Customer orders**: Cart items → formatted WhatsApp message → opens WhatsApp with store owner's number
4. **Images served**: Cloudinary CDN → browser (with on-the-fly transforms in URL)

---

## 5. Monorepo vs Separate Repos Strategy

### Why Two Separate Repositories?

The project uses **two separate Git repositories** (not a monorepo):

```
D:\Brand2Brand\          ← Customer-facing storefront
D:\Brand2Brand-Admin\    ← Admin dashboard
```

**Reasons for separation:**

1. **Independent Deployment**: Each app deploys independently on Vercel. A change to the admin panel doesn't trigger a rebuild of the customer site.
2. **Different Security Profiles**: The customer site has no auth — it's fully public. The admin has Supabase Auth with middleware protection. Keeping them separate prevents accidental exposure of admin routes.
3. **Different Dependencies**: Admin needs AWS SDK (for R2 presigned URLs), crypto (for Cloudinary signatures). Customer site doesn't need any of these — keeping it lean.
4. **Different Caching Strategies**: Customer site uses aggressive ISR + CDN caching. Admin always needs fresh data.
5. **Different Build Characteristics**: Customer site is optimized for SEO and Core Web Vitals. Admin prioritizes developer experience and functionality.

### How They Connect

Both applications share the **same Supabase project** (same database, same auth system):
- Same `NEXT_PUBLIC_SUPABASE_URL`
- Same `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Admin additionally uses `SUPABASE_SERVICE_ROLE_KEY` for bypassing RLS

### Why Not a Monorepo (Turborepo/Nx)?

- **Complexity overhead**: Two simple Next.js apps don't warrant monorepo tooling.
- **No shared components**: The customer site and admin panel have completely different UIs.
- **Deployment simplicity**: Vercel handles separate Git repos natively.

---

## 6. Database Design — Supabase / PostgreSQL

### Schema Overview

The database has 4 tables with a clear relational hierarchy:

```
categories (3 rows: Clothing, Footwear, Accessories)
    │
    ├── subcategories (many per category)
    │       │
    │       └── products (many per subcategory)
    │               │
    │               └── product_images (many per product)
```

### Table: `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,        -- e.g., "Clothing"
  slug TEXT NOT NULL UNIQUE,        -- e.g., "clothing"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current data**: Clothing, Footwear, Accessories

### Table: `subcategories`

```sql
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,               -- e.g., "Shirts"
  slug TEXT NOT NULL,               -- e.g., "shirts"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);
```

**Current subcategories**:
- Clothing: Shirts, Jeans, Hoodies, Kurthas
- Footwear: Shoes, Slides, Casual, Sports
- Accessories: Watches, Bags

### Table: `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'Brand 2 Brand',
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
  gender TEXT CHECK (gender IN ('men', 'women') OR gender IS NULL),
  price INTEGER NOT NULL,                        -- in INR (paise not used)
  original_price INTEGER,                        -- MRP / strikethrough price
  description TEXT,
  sizes TEXT[] DEFAULT '{}',                     -- PostgreSQL array: ['S','M','L','XL']
  colors TEXT[] DEFAULT '{}',                    -- PostgreSQL array: ['Black','Navy']
  badge TEXT CHECK (badge IN ('BESTSELLER', 'NEW', 'TRENDING', 'EXCLUSIVE') OR badge IS NULL),
  atmosphere_theme TEXT DEFAULT 'default',
  is_active BOOLEAN DEFAULT TRUE,                -- soft-delete / visibility toggle
  product_code TEXT,                             -- auto-generated: B2B-0001, B2B-0002
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Design Decisions:**

1. **`sizes TEXT[]` and `colors TEXT[]`**: Using PostgreSQL native arrays instead of a separate sizes/colors junction table. This is optimal because:
   - Sizes and colors are simple string lists, not entities with their own properties
   - Avoids N+1 query problems
   - Supabase JS client handles arrays natively
   - Single query returns everything needed to render a product card

2. **`price INTEGER`**: Prices stored as whole rupees (not paise). The store doesn't use decimal pricing (₹1,899 not ₹18.99). Integer math avoids floating-point issues.

3. **`is_active BOOLEAN`**: Soft-delete pattern. Products can be hidden from the storefront without deleting data. The admin toggle switches this.

4. **`product_code TEXT`**: Auto-generated sequential codes (B2B-0001, B2B-0002...) for easy reference in WhatsApp messages and physical store tags.

5. **`gender TEXT`**: Only used for Footwear and Watches which have gender-specific collections. Clothing is men-only in this store. NULL means "unisex/not applicable."

6. **`badge TEXT` with CHECK constraint**: Enum-like validation ensures only valid badge values. `NULL` means no badge.

7. **`ON DELETE RESTRICT` for subcategory_id**: Prevents accidental deletion of a subcategory that has products — the admin must first move/delete products.

8. **`ON DELETE CASCADE` for category_id in subcategories**: Deleting a category deletes all its subcategories (and cascades to products).

### Table: `product_images`

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  color_tag TEXT,                    -- e.g., "Black", "Navy" — links image to a colour variant
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Design Decisions:**

1. **Separate images table**: Each product can have multiple images (carousel). A separate table with `display_order` allows reordering without touching the product row.

2. **`color_tag TEXT`**: Maps an image to a specific colour variant. When `color_tag = 'Navy'`, the customer site shows that image when hovering over the "Navy" colour swatch. Images with `NULL` color_tag are generic/cover images.

3. **`ON DELETE CASCADE`**: When a product is deleted, all its images are automatically removed from the DB (the API also cleans up the actual files from Cloudinary/Storage).

### Database Indexes

```sql
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_badge ON products(badge);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, display_order);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
```

**Why these indexes:**
- `idx_products_is_active`: Every customer query filters by `is_active = true` — this index makes that filter O(1).
- `idx_products_badge`: Featured/New Arrivals queries filter by badge — indexed for speed.
- `idx_product_images_order`: Composite index for the most common image query pattern (get images for a product, ordered by display_order).

### Row Level Security (RLS)

```sql
-- Public read
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read subcategories" ON subcategories FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY "Auth users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');
-- ... similar for all tables
```

**Key Security Feature**: The public (anonymous) API key can ONLY read active products. Even if someone intercepts the Supabase URL and anon key, they cannot:
- Read inactive/hidden products
- Insert, update, or delete any data
- Access auth tables

The admin uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely — this key is only available server-side in Admin API routes.

### Updated_at Triggers

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Automatically tracks when records were last modified — useful for debugging and future features like "recently updated" sorting.

---

## 7. Data Flow — End to End

### Flow 1: Customer Views Home Page

```
1. Browser requests brand2brands.com
2. Vercel edge runs proxy.js (middleware)
   └── Refreshes Supabase session cookies (even though customer site has no auth)
3. Next.js renders page.js (Server Component)
   ├── getFeaturedProducts() — Supabase query for badge IN ('BESTSELLER','TRENDING')
   ├── getNewArrivals() — Supabase query for badge IN ('NEW','EXCLUSIVE')
   └── Both wrapped in React cache() for request deduplication
4. page.js passes data to HomeClient (Client Component)
5. ISR caches the rendered HTML for 7200 seconds (2 hours)
6. Subsequent requests serve cached HTML from Vercel CDN
7. Client-side: GSAP animates hero section, particles are generated
8. VizagIntro plays cinematic intro (only on first visit per session)
```

### Flow 2: Customer Views Product Detail

```
1. Browser requests /product/[uuid]
2. Next.js runs generateStaticParams() at build time
   └── Pre-renders top 50 most recent products
3. For this specific product:
   ├── getProductById(id) — full product data with description
   ├── getRelatedProducts(id, category, 4) — same-category products
   └── generateMetadata() — dynamic <title>, <meta>, OpenGraph tags
4. ProductDetailClient renders:
   ├── Image gallery with touch swipe support
   ├── Colour swatches (CSS-mapped from 100+ colour names)
   ├── Size selector
   ├── Add to Bag button (→ CartContext)
   └── "Enquire on WhatsApp" button (direct link with pre-filled message)
5. Related products rendered as ProductCard grid below
```

### Flow 3: Admin Adds a New Product

```
1. Admin logs in at admin.brand2brands.com/login
   ├── Supabase signInWithPassword()
   ├── JWT stored in httpOnly cookies
   └── Middleware redirects to dashboard
2. Admin navigates to /products/new
3. Admin fills form: name, brand, category, subcategory, price, sizes, colors, etc.
4. Admin selects images from device
5. Each image is:
   a. Compressed client-side (Canvas API → WebP, target 200KB)
   b. Uploaded directly to Cloudinary from browser (NO server relay)
   c. Cloudinary URL saved to DB via POST /api/save-image
6. Product metadata saved via POST /api/upload-product
   ├── Auth guard: requireAuth() validates JWT with Supabase servers
   ├── Auto-generates product_code (B2B-XXXX)
   └── Inserts into products table via service role key (bypasses RLS)
7. Product appears on customer site after ISR revalidation (up to 2 hours)
```

### Flow 4: Customer Places Order via WhatsApp

```
1. Customer browses products, adds items to cart
   └── Cart state managed in CartContext (React Context + useState)
2. Cart drawer opens (slide-in from right)
3. Discount engine computes per-category savings:
   ├── Clothing: 10% off
   ├── Footwear: 10% off
   ├── Accessories: 10% off
   └── Bags: 15% off (exclusive)
4. Bill breakdown shown: original total, per-category savings, final total
5. Customer clicks "Send Order on WhatsApp"
6. buildWhatsAppMessage() generates formatted text:
   ├── Item list with product codes, sizes, colours, quantities
   ├── Per-item discounted prices
   ├── Category savings breakdown
   └── Final total
7. Opens wa.me/918074548419?text=<encoded message> in new tab
8. WhatsApp opens with pre-filled message to store owner
```

---

## 8. Image Storage & Optimisation Pipeline

### Evolution of Image Storage

The project went through **three phases** of image storage:

1. **Phase 1 — Local Files** (`/public/products/`): Initial development used local product images in the public directory. Still present as fallback data.

2. **Phase 2 — Supabase Storage**: Images uploaded to Supabase Storage bucket `product-images`. Limited by 1GB free tier and no on-the-fly transformations.

3. **Phase 3 — Cloudinary (Current Primary)**: Images uploaded directly to Cloudinary from the browser. Provides global CDN, auto-format, auto-quality, and on-the-fly resizing.

4. **Phase 3b — Cloudflare R2 (Alternative)**: AWS S3-compatible storage with presigned URLs. Zero egress fees. Used as alternative upload path.

### Client-Side Image Compression (`compressImage.js`)

Before any upload, images are compressed in the browser:

```
Algorithm:
1. Decode image → Canvas element
2. Downscale to maxWidth (1920px default)
3. Binary-search quality (0.92 → 0.50) to find highest quality ≤ 200KB
4. If still too large, reduce dimensions step-by-step: 1600 → 1280 → 960 → 800
5. Output as WebP (30-50% smaller than JPEG at same quality)
6. Fall back to JPEG if browser doesn't support WebP export
```

**Why client-side compression?**
- Avoids sending 5-10MB raw photos to the server
- Reduces Vercel serverless function payload (4.5MB limit on free tier)
- WebP output matches what Cloudinary would serve anyway
- Users on slow connections upload faster

### Cloudinary Upload Flow

```
Browser                    Admin API                Cloudinary
  │                           │                        │
  ├── compressImage(file) ────┤                        │
  │   (200KB WebP output)     │                        │
  │                           │                        │
  ├── uploadToCloudinary() ───┼──── REST API ──────────►
  │   FormData: file +        │    /v1_1/CLOUD/        │
  │   timestamp +             │    image/upload         │
  │   api_key +               │                        │
  │   signature (SHA-1)       │                        │
  │                           │                        │
  │◄──────────────────────────┼──── { secure_url } ────┤
  │                           │                        │
  ├── POST /api/save-image ──►│                        │
  │   { productId,            │                        │
  │     imageUrl,             │── INSERT product_images │
  │     displayOrder,         │                        │
  │     colorTag }            │                        │
```

### Cloudinary URL Transformation (Customer Site)

The `optimizeImageUrl()` function in `queries.js` dynamically inserts transformation parameters:

```javascript
// Input:  https://res.cloudinary.com/xxx/image/upload/v123/folder/image.webp
// Output: https://res.cloudinary.com/xxx/image/upload/c_limit,w_800,q_auto,f_auto/v123/folder/image.webp
```

- `c_limit`: Limit dimensions without upscaling
- `w_800`: Max width 800px for product cards
- `q_auto`: Auto quality (Cloudinary's perceptual quality algorithm)
- `f_auto`: Auto format (serves WebP to Chrome, AVIF to supporting browsers, JPEG fallback)

### R2 Presigned URL Flow

```
Browser          Admin API (/api/r2-presigned-url)     Cloudflare R2
  │                    │                                    │
  ├── POST { folder,   │                                    │
  │    publicId,       │                                    │
  │    contentType } ──►                                    │
  │                    ├── PutObjectCommand (AWS SDK) ──────►
  │                    │   getSignedUrl(60 min expiry)       │
  │                    │                                    │
  │◄── { uploadUrl,  ──┤                                    │
  │      publicUrl }   │                                    │
  │                    │                                    │
  ├── PUT uploadUrl ───┼────────────────────────────────────►
  │   (direct upload)  │                                    │
```

### Blur Placeholder Generation (`imageUtils.js`)

For the `placeholder="blur"` prop on `<Image>`, a tiny SVG is generated per category:

```javascript
// Clothing/Footwear: Crimson tint (#C41230, 8% opacity)
// Accessories: Gold tint (#B8860B, 8% opacity)
// Renders as a soft colored rectangle while the real image loads
```

This avoids layout shift (CLS) and provides a branded loading experience.

---

## 9. Authentication & Security

### Customer Site — No Authentication

The customer-facing site has **no user authentication**. All data is publicly readable (enforced by Supabase RLS). There are no user accounts, no login, no saved carts.

The `proxy.js` (middleware) on the customer site only refreshes Supabase session cookies (no auth checks):

```javascript
// Customer proxy.js — minimal
export async function proxy(request) {
  // Just refresh cookies, no auth enforcement
  await supabase.auth.getUser();
  return supabaseResponse;
}
```

### Admin Site — Multi-Layer Security

The admin panel has **four layers of authentication**:

#### Layer 1: Edge Proxy (proxy.js)

Every request hits the proxy before reaching any page:

```javascript
// Runs at Vercel Edge — before any server component executes
const { data: { user } } = await supabase.auth.getUser();
// ↑ Calls Supabase servers — cannot be spoofed with a fake cookie

if (!isAuthenticated && !isPublic(pathname)) {
  // Redirect to /login with ?next= to preserve destination
  return NextResponse.redirect(loginUrl);
}

if (isAuthenticated && isPublic(pathname)) {
  // Already logged in, hitting /login → redirect to dashboard
  return NextResponse.redirect(dashboardUrl);
}
```

**Critical detail**: Uses `getUser()` NOT `getSession()`. `getSession()` only reads the local cookie and **can be spoofed**. `getUser()` validates the JWT with Supabase's servers.

#### Layer 2: Server-Side Layout Check

Even if middleware is bypassed (e.g., direct fetch), the root `layout.js` checks auth:

```javascript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Only render children (login page), no admin layout
  return <html><body>{children}</body></html>;
}
// Authenticated — render full admin layout with sidebar
return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
```

#### Layer 3: API Route Guards (`requireAuth.js`)

Every API route starts with:

```javascript
const { user, errorResponse } = await requireAuth();
if (errorResponse) return errorResponse; // 401 Unauthorised
```

This uses `getUser()` again — even if someone crafts a direct API request, they can't perform any mutation without a valid session.

#### Layer 4: Client-Side Session Monitoring

`AdminLayoutClient.js` subscribes to auth state changes:

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
    router.replace('/login');
  }
});
```

If the session expires or the user signs out from another tab, they're immediately redirected.

### Supabase Client Types

The project uses **three different Supabase client types**:

| Client | File | Purpose | Key Used |
|---|---|---|---|
| **Server Client** | `lib/supabase/server.js` | Server Components — reads cookies from `next/headers` | Anon Key |
| **Browser Client** | `lib/supabase/client.js` | Client Components — uses `@supabase/ssr` browser adapter | Anon Key |
| **Admin Client** | `lib/supabase/admin.js` | API Routes only — bypasses RLS | Service Role Key |

**Why three clients?**
- Server Components can't access browser cookies directly — they need the `cookies()` API from `next/headers`.
- Client Components run in the browser — they need a browser-compatible client.
- API routes that write data need to bypass RLS — they use the service role key (⚠️ server-side only, never exposed to browser).

### Security Headers (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

- **X-Frame-Options: DENY**: Prevents clickjacking — site cannot be embedded in iframes.
- **X-Content-Type-Options: nosniff**: Prevents MIME type sniffing attacks.
- **X-XSS-Protection**: Enables browser's built-in XSS filter.
- **Referrer-Policy**: Only sends full referrer for same-origin requests.

### Deployment Region

```json
{ "regions": ["sin1"] }  // Singapore — closest Vercel region to India
```

---

## 10. Customer-Facing Website — Feature Breakdown

### 10.1 Homepage (`/`)

**Server Component** (`page.js`) + **Client Component** (`HomeClient.js`)

**Sections (top to bottom):**

1. **VizagIntro**: Cinematic logo reveal animation (first visit only, per session)
2. **Hero Section**: Full-screen with particle effects, GSAP-animated text entrance, scroll indicator
3. **Discount Banner**: Infinite-scrolling ticker showing current offers (CSS-only animation via `@keyframes`)
4. **Explore Our Worlds**: 3 large atmosphere cards (Clothing, Footwear, Accessories) with hover overlays
5. **Trending Now**: Grid of products with badge BESTSELLER or TRENDING (max 8)
6. **New Arrivals**: Grid of products with badge NEW or EXCLUSIVE (max 8)
7. **Brand Story**: Two-column layout with Vizag-focused narrative and a CTA to Google Maps

**ISR**: `revalidate = 7200` (2 hours)

### 10.2 Clothing Page (`/clothing`)

**Server Component** fetches all clothing products + subcategories, passes to **ClothingClient**.

**Features:**
- **Hero Banner**: Full-width image with overlay text
- **Subcategory Tabs**: "All", "Shirts", "Jeans", "Hoodies", "Kurthas" — dynamically generated from DB
- **Product Grid**: 2-column mobile, 3-column tablet, 4-column desktop
- **Load More**: Shows 20 products initially, loads 20 more per click (client-side pagination, no additional API calls)
- **Empty State**: Styled message when a subcategory has no products

**Atmosphere**: Sets `clothing` theme (white background, crimson accent)

### 10.3 Footwear Page (`/footwear`)

**Client Component** — gender selection page.

**Features:**
- **Split Hero**: Two equal halves — "SHOP MEN" and "SHOP WOMEN"
- Each half has a background image, overlay, and CTA button
- Links to `/footwear/men` and `/footwear/women` respectively

**Atmosphere**: Sets `footwear` theme (off-white background, crimson accent)

### 10.4 Footwear Gender Pages (`/footwear/men`, `/footwear/women`)

**Server Component** fetches footwear products filtered by gender, passed to **FootwearGenderClient**.

**Features:**
- **Dynamic Hero**: Background gradient changes based on gender (blue for men, pink/purple for women)
- **Subcategory Tabs**: Only shows relevant subcategories for that gender
- **Product Grid + Load More**: Same pattern as Clothing

### 10.5 Accessories Page (`/accessories`)

**Server Component** fetches accessories grouped by type, passed to **AccessoriesClient**.

**Features:**
- **Dark Theme Hero**: Gold gradient on dark background
- **Watch Showcase**: Editorial section with full-width image and descriptive text
- **Men's Watches Grid**: Gold-accented section header
- **Women's Watches Grid**: Pink-accented section header (hidden if no products)
- **Premium Bags Grid**: Separate section with exclusive 15% discount tag
- **Per-section Load More**: Each section has independent load-more state

**Atmosphere**: Sets `accessories` theme (dark background, gold accent, inverted text)

### 10.6 Product Detail Page (`/product/[id]`)

**Server Component** with **SSG + ISR**.

**Features:**
- **Breadcrumb Navigation**: Home / Category / Product Name
- **Image Gallery**: Full-width hero with stacked layers, left/right arrows, touch swipe, dot navigation
- **Colour Browse Thumbnails**: Small image thumbnails below gallery — clicking shows that colour's image (does NOT select the colour for ordering)
- **Product Badge**: BESTSELLER, NEW, TRENDING, or EXCLUSIVE (styled crimson pill)
- **Brand & Name**: Hierarchical typography
- **Product Code**: Monospace display (e.g., #B2B-0042)
- **Price Display**: Current price + strikethrough original price + percentage off (green)
- **Description**: Full product description text
- **Size Selector**: Button grid, selected state with crimson border
- **Colour Selector**: Circle swatches with CSS-mapped colours (100+ named colours with hex/gradient mapping) + colour name label. Selected state with ring indicator.
- **Add to Bag**: Full-width crimson button, adds to CartContext
- **Enquire on WhatsApp**: Full-width dark button, opens WhatsApp with pre-filled product enquiry
- **Related Products**: "YOU MAY ALSO LIKE" — 4 products from same category

**Dynamic Metadata**: Title, description, OG image, Twitter card all generated from product data.

**Static Generation**: Top 50 most recent products are pre-rendered at build time via `generateStaticParams()`. Others are rendered on-demand and cached via ISR.

### 10.7 Contact Page (`/contact`)

**Client Component** — fully interactive.

**Features:**
- **Hero Banner**: Contact-specific image
- **Contact Form**: Name, Email, Phone/WhatsApp, Message fields with validation
- **Success Feedback**: Animated checkmark with auto-dismiss
- **Google Maps Embed**: Iframe with store location
- **Store Details**: Physical address, phone number, WhatsApp link
- **WhatsApp CTA**: Green button opening WhatsApp with pre-filled visit inquiry

**Note**: The contact form currently shows a success state but **does not actually send the message** (no backend handler). It's a UI placeholder — actual communication happens through WhatsApp.

### 10.8 404 Not Found Page

**Server Component** with custom cinematic design:
- Giant "404" with crimson "0" character
- Gradient divider line
- "PAGE NOT FOUND" heading
- Humorous subtitle: "The page you're looking for has wandered off the runway"
- Two CTAs: "BACK TO HOME" and "EXPLORE CLOTHING"
- Floating brand watermark

### 10.9 Loading State

Skeleton UI with pulsing animation:
- 6 skeleton cards in a grid
- Each card has: skeleton image, skeleton title, skeleton subtitle, skeleton price
- CSS-only pulse animation

---

## 11. Admin Panel — Feature Breakdown

### 11.1 Login Page (`/login`)

- Email + password form
- Supabase `signInWithPassword()` authentication
- Session check on mount — if already logged in, redirect to dashboard
- Error display for invalid credentials
- Loading spinner during authentication
- Preserves `?next=` URL for post-login redirect

### 11.2 Admin Layout

- **Sidebar Navigation**: Dashboard, Categories, Products, View Storefront (external link)
- **Top Bar**: Current page title, user avatar (first letter of email), hamburger menu (mobile)
- **Mobile Responsive**: Sidebar becomes overlay drawer on mobile with close button
- **Session Guard**: `onAuthStateChange` listener auto-redirects on session expiry
- **Logout**: Signs out of Supabase, clears cookies, redirects to login

### 11.3 Dashboard (`/`)

Server Component that fetches real-time statistics:

- **Quick Actions**: "Add Product", "Manage Categories", "All Products" buttons
- **Stat Cards**: Total Products, Active (Visible), Categories, Product Images
- **Storage Monitor**: Real-time Supabase Storage usage
  - Recursively walks ALL folders in the bucket
  - Shows used MB, percentage, remaining space, average image size
  - Visual progress bar
- **Category Breakdown**: Clickable cards showing each category with subcategory count and product count

### 11.4 Categories Management (`/categories`)

Client Component with full CRUD:

- **Add Category**: Text input + button, auto-generates slug
- **Category Cards**: Expandable accordion showing subcategories
- **Add Subcategory**: Inline form within category card
- **Delete Category/Subcategory**: Confirmation dialog, cascade handling
- **Auto-slugification**: "Men's Watches" → "mens-watches"

### 11.5 Products Listing (`/products`)

Client Component with search and filtering:

- **Search**: Real-time text search across name, brand, subcategory, category
- **Category Filter**: URL-param based filtering (from dashboard category cards)
- **Desktop Table View**: Image thumbnail, Name/Brand, Code, Category, Price, Badge, Visibility toggle, Edit/Delete actions
- **Mobile Card View**: Compact card layout with same functionality
- **Visibility Toggle**: iOS-style toggle switch — "Live" (green) or "Hidden" (grey)
- **Toggle Legend**: Explains what Active/Inactive means
- **Delete Modal**: Custom styled confirmation dialog with warning text, prevents accidental deletion
- **Suspense Boundary**: Wraps useSearchParams() for Next.js streaming compatibility

### 11.6 Add Product (`/products/new`)

Client Component with multi-step form:

- **Product Fields**: Name, Brand, Subcategory (dropdown), Gender, Price, Original Price, Description, Badge
- **Sizes**: Tag-style input (Add button + remove per tag)
- **Colors**: Tag-style input with colour preview
- **Image Upload**: Multi-file select with:
  - Client-side compression (Canvas → WebP, target 200KB)
  - Progress indicator per image
  - Direct upload to Cloudinary (not through server)
  - Drag-and-drop reordering for display_order
  - Colour tag assignment per image
- **Auto Product Code**: Generated server-side (B2B-XXXX)

### 11.7 Edit Product (`/products/[id]/edit`)

Similar to Add Product, but:
- Pre-fills all fields from existing product data
- Shows existing images with option to remove
- Removed images are cleaned up from Cloudinary/Supabase Storage
- New images can be added alongside existing ones
- Uses PUT `/api/edit-product` endpoint

---

## 12. Cart System & Discount Engine

### Cart State Management (CartContext.js)

```
CartProvider
  ├── items: Array<CartItem>           — products with size, colour, quantity
  ├── isOpen: boolean                  — cart drawer visibility
  ├── addItem(product, size, colour)   — adds or increments quantity
  ├── removeItem(cartId)               — removes item
  ├── updateQuantity(cartId, qty)      — updates quantity (removes if 0)
  ├── totalItems: number               — sum of all quantities
  ├── subtotal: number                 — pre-discount total (backward compat)
  ├── originalTotal: number            — pre-discount total
  ├── savingsByCategory: object        — { clothing: N, footwear: N, ... }
  ├── totalSavings: number             — sum of all category savings
  ├── finalTotal: number               — original minus savings
  └── itemBreakdown: Array             — items with computed discount fields
```

**Why React Context over Redux/Zustand?**
- Simple cart with < 50 items — no complex state transitions
- No persistence needed (cart is ephemeral — WhatsApp-based ordering)
- No SSR state hydration needed
- Zero dependency added

**Why not localStorage persistence?**
- The business model is "browse → WhatsApp order" — carts are short-lived
- No user accounts to tie carts to
- Avoids stale cart items with wrong prices

### Discount Engine (discounts.js)

```javascript
// Category-level discounts
DISCOUNT_RATES = {
  clothing: 0.10,     // 10%
  footwear: 0.10,     // 10%
  accessories: 0.10,  // 10%
};

// Subcategory override — takes priority
SUBCATEGORY_DISCOUNT_RATES = {
  bags: 0.15,         // 15% — exclusive offer
};
```

**Discount Calculation Flow:**

```
getDiscountRate(category, subcategory)
  ├── If subcategory in SUBCATEGORY_DISCOUNT_RATES → use subcategory rate
  └── Else → use DISCOUNT_RATES[category] (default 0 if unknown)

computeCartTotals(items)
  ├── For each item:
  │   ├── Get rate from getDiscountRate()
  │   ├── originalLineTotal = price × quantity
  │   ├── discountedLineTotal = originalLineTotal × (1 - rate)
  │   └── saving = originalLineTotal - discountedLineTotal
  ├── Aggregate savingsByCategory
  ├── totalSavings = sum of all category savings
  └── finalTotal = originalTotal - totalSavings
```

### Cart Drawer UI (CartDrawer.js)

- **Slide-in Overlay**: Opens from right side with dark backdrop
- **Per-Item Display**: Image thumbnail, name, size/colour, price (with discount if applicable)
- **Quantity Controls**: ± buttons with inline quantity display
- **Remove Button**: Per-item removal
- **Bill Breakdown**:
  - Original Total
  - Per-category savings (only shown if > 0)
  - "🎉 YOU SAVE" total savings banner
  - Divider
  - **TOTAL** in bold
- **WhatsApp CTA**: Green button "Send Order on WhatsApp"

---

## 13. WhatsApp Integration — Order Flow

### How It Works

There is **no payment gateway, no server-side order processing, no order database**. The entire order is a pre-formatted WhatsApp message.

### WhatsApp Message Format (buildWhatsAppMessage)

```
🛍️ *NEW ORDER — Brand 2 Brand*

1. *Midnight Floral Print Shirt* [B2B-0001]
   Size: M | Colour: Navy | Qty: 2
   Price: ₹1,899 × 2 = ₹3,798 → After 10% OFF: ₹3,418

2. *Premium Leather Tote Bag* [B2B-0042]
   Size: One Size | Colour: Beige/Multi | Qty: 1
   Price: ₹6,999 × 1 = ₹6,999 → After 15% OFF: ₹5,949

━━━━━━━━━━━━━━━━━━━━
Clothing (10% off) saved: −₹380
Bags (15% off — Exclusive) saved: −₹1,050
Original Total : ₹10,797
Total Savings  : −₹1,430
*FINAL TOTAL   : ₹9,367*
━━━━━━━━━━━━━━━━━━━━
Please confirm availability & shipping details. Thank you! 🙏
```

### Three WhatsApp Entry Points

1. **Cart Drawer**: After building a cart, the "Send Order on WhatsApp" button generates the full order message.
2. **Product Detail Page**: "ENQUIRE ON WHATSAPP" button opens WhatsApp with a single-product enquiry message including product name, code, price, selected colour and size.
3. **Floating WhatsApp Widget**: Green circular button (bottom-right) that opens WhatsApp with a generic "I'm interested in your products" message. Hides when cart is open to avoid double CTAs.

### URL Format

```
https://wa.me/918074548419?text=<encodeURIComponent(message)>
```

- `918074548419`: India country code (91) + owner's phone number
- Message is URL-encoded to handle special characters, emojis, and line breaks

---

## 14. Atmosphere Theming System

### Concept

Each product category has a distinct visual "atmosphere" — a colour palette that changes the entire page feel when you navigate to that category. This creates a **luxury boutique experience** where each section of the store has its own ambiance.

### Theme Definitions (AtmosphereContext.js)

| Theme | Background | Text | Accent | Surface |
|---|---|---|---|---|
| **default** | #FAFAFA (white) | #1A1A1A (dark) | #C41230 (crimson) | #FFFFFF |
| **clothing** | #FAFAFA | #1A1A1A | #C41230 | #FFFFFF |
| **footwear** | #F5F5F0 (warm white) | #1A1A1A | #C41230 | #FFFFFF |
| **accessories** | #0D0D0D (near black) | #FAFAFA (white) | #B8860B (gold) | #1A1A1A |

### Implementation

```javascript
// AtmosphereContext sets CSS Custom Properties on :root
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty('--atmosphere-bg', theme.bg);
  root.style.setProperty('--atmosphere-text', theme.text);
  root.style.setProperty('--atmosphere-accent', theme.accent);
  root.style.setProperty('--atmosphere-surface', theme.surface);
  root.style.setProperty('--atmosphere-surface-hover', theme.surfaceHover);
}, [currentAtmosphere]);
```

All CSS throughout the site uses these variables:
```css
body {
  background-color: var(--atmosphere-bg);
  color: var(--atmosphere-text);
}
.product-card { background: var(--atmosphere-surface); }
.btn-magnetic { background: var(--atmosphere-accent); }
```

### Why Not CSS Class Switching?

Using CSS Custom Properties instead of class-based themes:
- **No duplication**: Don't need `.theme-clothing .btn`, `.theme-accessories .btn`
- **Smooth transitions**: CSS transitions work on custom property changes
- **Runtime dynamic**: Can interpolate between themes
- **Single source of truth**: Theme values defined once in JS, applied everywhere via CSS

---

## 15. Cinematic Intro Animation (VizagIntro)

### Overview

The VizagIntro is a **10-act cinematic logo reveal** that plays once per session when a user first visits the site. It features:

- **Custom Audio Engine**: Procedurally generated cinematic BGM using the Web Audio API (no audio files needed)
- **GSAP Timeline**: Precise multi-act sequence with parallel animations
- **Particle System**: Spark particles and ambient floating particles
- **Light Effects**: Crimson and gold light streaks crossing the screen

### The 10 Acts

| Act | Action | Audio |
|---|---|---|
| 1 | Dark background with subtle glow appears | Deep bass drone (D1 + A1 power fifth) |
| 2 | Crimson and gold light streaks sweep across | Rising sweep + whoosh |
| 3 | "BRAND" crashes in from the left | Dm chord slam |
| 4 | "2" drops in from above with massive impact | **MASS IMPACT** — sub-bass + power chord + taiko hit |
| 5 | "BRAND'S" crashes in from the right | Text slam chord |
| 6 | Underline gradient draws across | Shimmer (D major arpeggio) |
| 7 | "Fashion Store" subtitle fades up | — |
| 8 | Ambient particles float upward | — |
| 9 | Hold — let it breathe | — |
| 10 | Everything scales up and fades out | Exit swell (reverse cymbal feel) |

### Audio Engine Details

The BGM is **entirely procedurally generated** using the Web Audio API:

- **Oscillators**: Sine, sawtooth, square waves at specific frequencies
- **Filters**: BiquadFilter for bandpass, lowpass, highpass effects
- **Reverb**: Convolver with randomly generated impulse response
- **Compressor**: DynamicsCompressor for that punchy "mass" feel
- **No audio files**: Zero network requests for audio

### Session-Based Single Play

```javascript
useEffect(() => {
  if (sessionStorage.getItem('vizag-intro-done')) return;  // Already played
  // ... play intro
  sessionStorage.setItem('vizag-intro-done', '1');  // Mark as done
}, []);
```

### Accessibility

```javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  sessionStorage.setItem('vizag-intro-done', '1');
  return;  // Skip intro entirely for users who prefer reduced motion
}
```

### Audio Auto-Play Handling

Browsers block auto-play audio. The intro handles this gracefully:
1. Tries to auto-play immediately
2. Listens for ANY user interaction (click, touch, mousemove, keydown, scroll)
3. Resumes AudioContext on first interaction
4. Animation plays regardless — audio is a bonus, not a requirement

---

## 16. SEO & Metadata Strategy

### Static Metadata (layout.js)

```javascript
export const metadata = {
  title: 'Brand 2 Brand | Premium Multi-Brand E-Commerce Store',
  description: 'Shop the latest premium clothing, footwear, and accessories...',
  keywords: 'Brand 2 Brand, premium fashion, clothing, footwear, accessories...',
  icons: { icon: '/products/logo/B2blogo.jpg' },
  openGraph: {
    title: 'Brand 2 Brand | Premium Multi-Brand E-Commerce Store',
    description: '...',
    type: 'website',
    url: 'https://brand2brands.com',
  },
};
```

### Dynamic Product Metadata (product/[id]/page.js)

Every product page has unique:
- **Title**: "Product Name by Brand | Brand Two Brand's"
- **Description**: Product description or auto-generated from name, brand, price, category
- **Keywords**: Product-specific keywords
- **OpenGraph Image**: First product image
- **Twitter Card**: Large image summary card

### Sitemap (sitemap.js)

```javascript
export const revalidate = 86400; // Regenerate once per day
```

- **Static pages**: Home, Clothing, Footwear, Accessories, Contact, Footwear/Men, Footwear/Women
- **Dynamic pages**: All active product detail pages (fetched from DB)
- **Timeout protection**: 5-second AbortController timeout on DB query
- **Fallback**: If DB is down, still returns static pages

### Robots.txt (robots.js)

```javascript
{
  rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] },
  sitemap: 'https://brand2brands.com/sitemap.xml',
}
```

### Heading Hierarchy

- **Home**: `<h1 class="sr-only">` (screen-reader only) for the store name
- **Category pages**: `<h1>` for category name (e.g., "MEN'S CLOTHING")
- **Product detail**: `<h1>` for product name
- **Section titles**: `<h2>` for "TRENDING NOW", "NEW ARRIVALS", etc.

---

## 17. Performance Optimisation

### 1. Code Splitting with Dynamic Imports

```javascript
// Heavy components are lazy-loaded
const CartDrawer = dynamic(() => import('@/components/CartDrawer'));
const VizagIntro = dynamic(() => import('@/components/VizagIntro'));
```

CartDrawer and VizagIntro are large components (~10KB and ~19KB respectively). Dynamic imports split them into separate chunks loaded on demand.

### 2. Console Removal in Production

```javascript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
},
```

SWC compiler strips all `console.log()` calls in production builds — keeps error/warn for debugging.

### 3. React Cache for Request Deduplication

```javascript
export const getProductsByCategory = cache(async (categorySlug) => {
  // ...Supabase query
});
```

React's `cache()` function ensures that if the same query function is called multiple times in the same server request (e.g., layout and page both need categories), the database is only hit once.

### 4. Dual Select Queries

```javascript
const LISTING_SELECT = `id, name, brand, price, ...`; // No description
const PRODUCT_SELECT = `id, name, brand, price, description, ...`; // With description
```

Listing pages use `LISTING_SELECT` which excludes `description` — lighter JSON payload for pages that only show product cards. Only the product detail page uses `PRODUCT_SELECT`.

### 5. Image Optimization

- `images.unoptimized = true`: Disables Vercel's image optimization to avoid hitting the 1000-image free tier limit. Instead, Cloudinary handles all optimization.
- `sizes` prop on every `<Image>`: Tells the browser exact sizes, preventing over-fetching.
- `priority` prop on hero images: Triggers preload for above-the-fold images.
- `placeholder="blur"` with `blurDataURL`: Inline SVG blur placeholder prevents layout shift.

### 6. Particle Generation Deferred

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    setClientParticles(Array.from({ length: 20 }, ...));
  }, 0);
}, []);
```

Particle positions are generated via `setTimeout(fn, 0)` — yields to the main thread, preventing hydration mismatches and keeping first paint fast.

---

## 18. Caching Strategy — ISR, CDN, Headers

### ISR (Incremental Static Regeneration)

| Page | Revalidate | Reason |
|---|---|---|
| Home (`/`) | 7200s (2 hours) | Featured/new products don't change often |
| Clothing (`/clothing`) | 7200s | Product list is relatively stable |
| Accessories (`/accessories`) | 7200s | Same reasoning |
| Footwear Gender (`/footwear/[gender]`) | 1800s (30 min) | More frequently updated |
| Product Detail (`/product/[id]`) | 7200s | Individual products rarely change |
| Sitemap | 86400s (1 day) | Search engines don't crawl faster |

### CDN Cache Headers (next.config.mjs)

| Path Pattern | Cache-Control | Purpose |
|---|---|---|
| `/clothing`, `/footwear`, `/accessories` | `s-maxage=600, stale-while-revalidate=1800` | CDN caches for 10 min, serves stale for 30 min while revalidating |
| `/product/:id` | `s-maxage=1800, stale-while-revalidate=7200` | Product pages cached 30 min, stale-served for 2 hours |
| `/images/*` | `max-age=31536000, immutable` | Static images cached for 1 year (they never change) |
| `/products/*` | `max-age=31536000, immutable` | Product images cached for 1 year |

### Why Stale-While-Revalidate?

When a page cache expires:
1. **Without SWR**: User waits for server to generate new page → slow
2. **With SWR**: User gets the stale (cached) page immediately → server regenerates in background → next user gets fresh page

This provides **instant responses** while still keeping content fresh.

---

## 19. Responsive Design & Mobile-First Approach

### Breakpoint Strategy

The CSS uses these breakpoints (inferred from `globals.css`):

| Breakpoint | Target | Key Changes |
|---|---|---|
| < 480px | Small phones | 2-column product grid, compact spacing |
| < 768px | Phones & small tablets | Mobile nav bar, split hero stacks vertically |
| < 1024px | Tablets | 3-column grid, sidebar collapses (admin) |
| ≥ 1024px | Desktop | 4-column grid, full sidebar (admin) |

### Mobile-Specific Features

1. **Mobile Navigation Bar**: Second `<nav>` row below header (hidden on desktop via CSS)
2. **Touch Swipe**: Product image carousels support left/right swipe with 40px threshold
3. **Mobile Cart Icon**: Persistent small cart icon on product cards (always visible, unlike desktop hover-only "Quick Add")
4. **Admin Mobile Cards**: Product listing switches from table to card layout on mobile
5. **Admin Hamburger Menu**: Sidebar becomes slide-out drawer with overlay on mobile

### Product Card Responsive Behavior

- **Desktop**: Hover reveals "Quick Add" bar sliding up from bottom + left/right arrows
- **Mobile**: Persistent small cart icon (bottom-right), touch swipe for images
- **Colour Thumbnails**: Shown on category pages, hidden on home page (`hideColorThumbs` prop)

---

## 20. CSS Architecture & Design System

### Design Tokens (CSS Custom Properties)

The entire design system is built on CSS variables in `:root`:

**Brand Palette**: 12 colours from charcoal (#1A1A1A) to crimson (#C41230) to gold (#B8860B)

**Typography Scale**:
- `--font-logo`: Bebas Neue — display font for the brand logo
- `--font-heading`: Bebas Neue — all uppercase headings (section titles, page titles)
- `--font-subheading`: Playfair Display (serif, italic) — elegant subtitles
- `--font-body`: Montserrat — clean, modern body text

**Spacing Scale**: 8 levels from `--space-xs` (0.25rem) to `--space-4xl` (6rem)

**Shadows**: 4 levels from subtle (1px blur) to dramatic (60px blur)

**Transitions**: 4 named timing functions:
- `--transition-fast`: 150ms — button hovers
- `--transition-normal`: 300ms — card hovers
- `--transition-slow`: 500ms — page transitions
- `--transition-liquid`: 700ms — smooth opening animations (custom bezier curve)

**Z-Index Scale**: Named layers from `--z-base` (1) to `--z-intro` (1000)

### Key CSS Patterns

1. **`.btn-magnetic`**: Primary CTA button with hover scale-up effect
2. **`.product-card`**: Card with stacked image layers for smooth transitions
3. **`.category-hero`**: Full-width hero section with overlay text
4. **`.atmosphere-card`**: Category navigation card with hover reveal
5. **`.discount-ticker`**: CSS-only infinite horizontal scroll animation
6. **`.whatsapp-widget`**: Fixed-position floating button with pulse animation

---

## 21. Component Architecture

### Customer Site Components

| Component | Type | File | Purpose |
|---|---|---|---|
| **Header** | Client | `components/Header.js` | Logo, desktop nav, mobile nav, cart button with count |
| **Footer** | Server | `components/Footer.js` | Brand info, store address, phone, WhatsApp, Instagram |
| **ProductCard** | Client | `components/ProductCard.js` | Product card with image carousel, colour thumbs, quick add |
| **CartDrawer** | Client | `components/CartDrawer.js` | Slide-in cart with bill breakdown and WhatsApp CTA |
| **VizagIntro** | Client | `components/VizagIntro.js` | Cinematic logo intro animation with audio |
| **WhatsAppWidget** | Client | `components/WhatsAppWidget.js` | Floating WhatsApp button (hides when cart open) |

### Context Providers

| Provider | File | Purpose |
|---|---|---|
| **CartProvider** | `context/CartContext.js` | Cart state, discount calculations |
| **AtmosphereProvider** | `context/AtmosphereContext.js` | Dynamic theme switching |

### Server vs Client Component Split

**Pattern used**: "Server Component fetches data, Client Component handles interactivity"

```
page.js (Server Component)
  ├── Fetches data from Supabase
  ├── Passes data as props to Client Component
  └── Sets revalidate for ISR

XxxClient.js (Client Component)
  ├── Receives data as props (no fetch)
  ├── Manages UI state (tabs, pagination, hover)
  ├── Handles user interactions
  └── Sets atmosphere theme
```

This pattern is used for: HomeClient, ClothingClient, FootwearGenderClient, AccessoriesClient, ProductDetailClient.

---

## 22. Routing Architecture

### Customer Site Routes

```
/                           → Home page (ISR 2h)
/clothing                   → Clothing listing with subcategory tabs (ISR 2h)
/footwear                   → Gender selection split page (client-only)
/footwear/men               → Men's footwear listing (ISR 30min)
/footwear/women             → Women's footwear listing (ISR 30min)
/accessories                → Grouped accessories page (ISR 2h)
/product/[id]               → Product detail (SSG + ISR 2h)
/contact                    → Contact page (client-only)
/sitemap.xml                → Dynamic sitemap (revalidate daily)
/robots.txt                 → Robots configuration
```

### Admin Site Routes

```
/login                      → Login page (public)
/                           → Dashboard (protected)
/categories                 → Category management (protected)
/products                   → Product listing (protected)
/products/new               → Add product form (protected)
/products/[id]/edit         → Edit product form (protected)

/api/products               → GET all products
/api/upload-product         → POST create product
/api/edit-product           → PUT update product
/api/delete-product         → DELETE remove product + images
/api/toggle-product         → POST toggle is_active
/api/save-image             → POST save image URL to DB
/api/r2-presigned-url       → POST get R2 upload URL
/api/debug-storage          → GET storage debug info
```

---

## 23. API Routes (Admin)

### POST `/api/upload-product`

- **Auth**: requireAuth() guard
- **Input**: JSON body with product fields
- **Process**:
  1. Validates required fields (name, price, subcategoryId)
  2. Auto-generates product code (B2B-XXXX) by querying max existing code
  3. Inserts product row via service role (bypasses RLS)
- **Output**: `{ productId, productCode }`
- **Note**: Does NOT handle image uploads — those go directly to Cloudinary

### PUT `/api/edit-product`

- **Auth**: requireAuth() guard
- **Input**: JSON body with updated fields + `removedImageIds[]`
- **Process**:
  1. Updates product row
  2. For each removed image: deletes from Cloudinary (or Supabase Storage if legacy), then deletes DB row
- **Output**: `{ success: true, images: { deleted: N } }`

### DELETE `/api/delete-product`

- **Auth**: requireAuth() guard
- **Input**: `{ productId }`
- **Process**:
  1. Fetches all product images
  2. Deletes each image from its storage service (Cloudinary or Supabase)
  3. Deletes product row (CASCADE deletes image rows)
- **Output**: `{ success: true }`

### POST `/api/toggle-product`

- **Auth**: requireAuth() guard
- **Input**: `{ productId, isActive }`
- **Process**: Updates `is_active = !isActive`
- **Output**: `{ success: true, is_active: newValue }`

### POST `/api/save-image`

- **Auth**: requireAuth() guard
- **Input**: `{ productId, imageUrl, displayOrder, colorTag }`
- **Process**: Inserts row into `product_images` table
- **Output**: `{ success: true }`

### POST `/api/r2-presigned-url`

- **Auth**: requireAuth() guard
- **Input**: `{ folder, publicId, contentType }`
- **Process**: Generates presigned PutObject URL using AWS SDK
- **Output**: `{ uploadUrl, publicUrl }`

---

## 24. Middleware / Proxy Layer

### Next.js 16 Proxy Pattern

Both apps use `src/proxy.js` (exported as `proxy` function) — this is Next.js 16's equivalent of the traditional `middleware.ts`.

### Customer Proxy (minimal)

```javascript
export async function proxy(request) {
  // 1. Build Supabase client with cookie read/write
  // 2. Call getUser() to refresh session tokens
  // 3. Return response (no auth enforcement)
}
```

Only purpose: keep Supabase session cookies fresh for server components.

### Admin Proxy (full auth enforcement)

```javascript
export async function proxy(request) {
  // 1. Bypass static assets
  // 2. Build Supabase client with cookie read/write
  // 3. Call getUser() — validated with Supabase servers
  // 4. If not authenticated AND not on /login → redirect to /login
  // 5. If authenticated AND on /login → redirect to dashboard
  // 6. Return cookie-refreshed response
}
```

### Matcher Pattern

```javascript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|woff|woff2)$).*)',
  ],
};
```

This regex matches ALL routes EXCEPT static assets — avoids hitting Supabase for every CSS/JS chunk request.

---

## 25. Error Handling & Edge Cases

### Image Fallbacks (ProductCard)

```javascript
const [failedImages, setFailedImages] = useState(new Set());

// If image fails to load:
onError={() => handleImageError(index)}

// Renders gradient placeholder instead:
if (!src || hasFailed) {
  return <div style={{ background: getPlaceholderGradient(product.id, index) }}>
    <span>{product.subcategory}</span>
  </div>;
}
```

### Cart Item Image Fallbacks (CartDrawer)

```javascript
// Category-coloured tile with product initials
const initials = item.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
return <div style={{ background: bg }}>{initials}</div>;
```

### Supabase Nested Filter Quirk

```javascript
// Supabase's .eq() on nested relations doesn't filter parent rows
// Must filter client-side as a safety net:
return (data || [])
  .filter((p) => p.subcategories?.categories?.slug === categorySlug)
  .map(shapeProduct);
```

### Sitemap DB Timeout

```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
// If DB is unreachable, still return static pages
```

### Colour Name Resolution (ProductDetailClient)

For product detail page colour swatches, there's a comprehensive fallback chain:

```
1. Check 100+ entry COLOR_CSS lookup map
2. Try native CSS colour name via Canvas API
3. Try first word of compound name (e.g., "Brown" from "Brown/White")
4. Fall back to #888 grey
```

---

## 26. Deployment Architecture

### Vercel Configuration

**Customer Site**:
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

**Region**: Singapore (`sin1`) — closest Vercel edge region to India for lowest latency.

### Build & Deployment Flow

```
Git Push → Vercel Build
  ├── next build
  │   ├── Static pages generated (SSG)
  │   ├── ISR pages generated with revalidation timers
  │   ├── API routes bundled as serverless functions
  │   └── Client JS chunks tree-shaken and minified
  ├── Console.log calls stripped (production)
  └── Deployed to Vercel Edge Network (sin1 primary)
```

### Environment Variables (Vercel Dashboard)

Must be set in Vercel project settings (not committed to Git):

**Customer Site:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Admin Site (additional):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ACCESS_KEY_ID`
- `CLOUDFLARE_SECRET_ACCESS_KEY`
- `CLOUDFLARE_BUCKET_NAME`
- `CLOUDFLARE_PUBLIC_DOMAIN`
- `NEXT_PUBLIC_STOREFRONT_URL`

---

## 27. Environment Variables & Configuration

### Customer Site `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  (only for migration scripts)
```

### Admin Site `.env.local`

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Cloudinary
CLOUDINARY_CLOUD_NAME=dbj9ittfl
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_PUBLIC_DOMAIN=https://images.brand2brands.com

# App
NEXT_PUBLIC_STOREFRONT_URL=https://brand2brands.com
```

### `NEXT_PUBLIC_` Prefix Convention

Variables prefixed with `NEXT_PUBLIC_` are **exposed to the browser** (included in client bundles). Variables WITHOUT the prefix are **server-only** — never sent to the client.

- ✅ `NEXT_PUBLIC_SUPABASE_URL` → browser needs this to make API calls
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → browser needs this (safe — limited by RLS)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` → NEVER exposed (bypasses all security)
- ❌ `CLOUDINARY_API_SECRET` → NEVER exposed (would allow arbitrary uploads)

---

## 28. Migration & Data Seeding

### Phase 1: Local Product Data (`src/data/products.js`)

The initial development used a **static JavaScript file** with all product data hardcoded. This file contains:
- 22 products across all categories
- Complete product objects with images referencing `/public/products/` paths
- Helper functions (getProductsByCategory, getFeaturedProducts, etc.)

### Phase 2: Database Migration (`scripts/migrate.js`)

Migration script that:
1. Reads product data from the inline array
2. Creates categories and subcategories (upsert — skip if exists)
3. For each product:
   - Creates the product row in Supabase
   - Reads local image files from `/public/products/`
   - Uploads each image to Supabase Storage bucket
   - Creates `product_images` rows with storage URLs

### Phase 3: Cloudinary Migration (`scripts/migrate-to-cloudinary.js`)

Follow-up migration that:
1. Fetches all `product_images` from DB
2. For images hosted on Supabase Storage:
   - Downloads the image
   - Re-uploads to Cloudinary
   - Updates the `image_url` in DB to the Cloudinary URL

### Phase 4: Storage Cleanup (`scripts/cleanup-supabase-storage.js`)

After Cloudinary migration:
1. Walks all files in Supabase Storage bucket
2. Removes files that have been migrated to Cloudinary
3. Frees up the 1GB storage limit

### Database Schema Setup (`scripts/schema.sql`)

Run in Supabase SQL Editor to create all tables, indexes, RLS policies, and triggers.

---

## 29. Development Workflow & Precautions

### Development Setup

```bash
# Customer site
cd D:\Brand2Brand
npm run dev          # Starts on localhost:3000

# Admin site (in separate terminal)
cd D:\Brand2Brand-Admin
npm run dev          # Starts on localhost:3001
```

### LAN Testing

```javascript
// next.config.mjs
allowedDevOrigins: ['192.168.0.109'],
```

Allows accessing the dev server from other devices on the same WiFi (e.g., testing on a real phone).

### Precautions Taken

1. **Free Tier Awareness**:
   - `images.unoptimized = true` — avoids Vercel's 1000-image optimization limit
   - Client-side image compression — keeps file sizes under 200KB to preserve Supabase Storage/Cloudinary quotas
   - ISR revalidation timers are conservative (2 hours) to reduce serverless function invocations

2. **Security**:
   - `getUser()` over `getSession()` everywhere — server-validated JWT
   - Service Role Key only in server-side API routes
   - RLS enabled on all tables
   - Security headers in `vercel.json`

3. **Performance**:
   - Code splitting with dynamic imports
   - Dual select queries (listing vs detail)
   - React cache() for request dedup
   - Aggressive CDN caching headers

4. **Data Safety**:
   - `ON DELETE RESTRICT` on product → subcategory relationship
   - Custom delete modal with warning text
   - Toggle (soft-delete) vs permanent delete distinction
   - Image cleanup before product deletion

5. **UX**:
   - `suppressHydrationWarning` on `<html>` and `<body>` to handle dynamic theme attribute injection
   - `prefers-reduced-motion` check for accessibility
   - Touch swipe support on all image carousels
   - Skeleton loading states

---

## 30. Accessibility (a11y)

### Implemented Features

1. **Screen-reader only h1**: `<h1 class="sr-only">Brand 2 Brand E-Commerce Store</h1>` in the root layout
2. **ARIA labels**: All buttons (`aria-label="Open cart"`, `aria-label="Previous image"`, `aria-label="Chat on WhatsApp"`)
3. **Semantic nav elements**: `<nav aria-label="Main navigation">`, `<nav aria-label="Mobile navigation">`
4. **Alt text**: All images have descriptive alt text
5. **Keyboard navigation**: All interactive elements are `<button>` or `<a>` (not `<div onClick>`)
6. **Reduced motion**: VizagIntro and hero animations respect `prefers-reduced-motion: reduce`
7. **Unique IDs**: All interactive elements have unique IDs for testing (`id="cart-button"`, `id="whatsapp-widget"`, etc.)
8. **Form labels**: Contact form has proper `<label htmlFor>` associations
9. **Input autocomplete**: Login form uses `autoComplete="username"` and `autoComplete="current-password"`

---

## 31. File-by-File Reference

### Customer Site (`D:\Brand2Brand\`)

```
src/
├── app/
│   ├── layout.js                  — Root layout: CartProvider, AtmosphereProvider, Header, Footer, Analytics
│   ├── page.js                    — Home: fetches featured + new arrivals (Server Component)
│   ├── HomeClient.js              — Home: hero, discount banner, atmospheres, product grids (Client)
│   ├── globals.css                — Complete design system (3,189 lines)
│   ├── loading.js                 — Skeleton loading UI
│   ├── not-found.js               — Custom 404 page
│   ├── robots.js                  — Robots.txt configuration
│   ├── sitemap.js                 — Dynamic XML sitemap
│   ├── clothing/
│   │   ├── page.js                — Fetches clothing products + subcategories
│   │   └── ClothingClient.js      — Tab filtering, product grid, load more
│   ├── footwear/
│   │   ├── page.js                — Gender selection split hero
│   │   └── [gender]/
│   │       ├── page.js            — Fetches footwear by gender
│   │       └── FootwearGenderClient.js — Tab filtering, product grid
│   ├── accessories/
│   │   ├── page.js                — Fetches grouped accessories
│   │   └── AccessoriesClient.js   — Watch showcase, per-section grids
│   ├── product/
│   │   └── [id]/
│   │       ├── page.js            — SSG params, dynamic metadata, data fetch
│   │       └── ProductDetailClient.js — Gallery, colour swatches, size picker, cart
│   └── contact/
│       └── page.js                — Contact form, Google Maps, store details
├── components/
│   ├── Header.js                  — Logo, nav links, cart button
│   ├── Footer.js                  — Brand info, address, social links
│   ├── ProductCard.js             — Product card with image carousel
│   ├── CartDrawer.js              — Cart sidebar with bill breakdown
│   ├── VizagIntro.js              — Cinematic intro animation
│   └── WhatsAppWidget.js          — Floating WhatsApp button
├── context/
│   ├── CartContext.js             — Cart state + discount engine
│   └── AtmosphereContext.js       — Theme switching
├── lib/
│   ├── queries.js                 — All Supabase query functions
│   ├── discounts.js               — Discount rates + cart calculation + WhatsApp message
│   ├── imageUtils.js              — Blur placeholder SVG generator
│   └── supabase/
│       ├── server.js              — Server-side Supabase client
│       ├── client.js              — Browser-side Supabase client
│       └── admin.js               — Admin (service role) Supabase client
├── data/
│   └── products.js                — Legacy static product data (22 products)
└── proxy.js                       — Edge middleware (session refresh only)

scripts/
├── schema.sql                     — Database schema DDL
├── migrate.js                     — Product data + image migration to Supabase
├── migrate-to-cloudinary.js       — Supabase Storage → Cloudinary migration
└── cleanup-supabase-storage.js    — Remove migrated files from Supabase Storage

public/
├── products/                      — Local product images (legacy)
├── images/                        — Static site images (heroes, atmospheres)
└── favicon.ico
```

### Admin Site (`D:\Brand2Brand-Admin\`)

```
src/
├── app/
│   ├── layout.js                  — Root layout with server-side auth check
│   ├── AdminLayoutClient.js       — Sidebar, topbar, session guard (Client)
│   ├── admin.css                  — Complete admin design system (44KB)
│   ├── page.js                    — Dashboard: stats, storage monitor, category overview
│   ├── login/
│   │   ├── layout.js              — Minimal layout for login page
│   │   └── page.js                — Email/password login form
│   ├── categories/
│   │   └── page.js                — Category/subcategory CRUD
│   ├── products/
│   │   ├── page.js                — Product listing with search, filter, toggle, delete
│   │   ├── new/
│   │   │   └── page.js            — Add product form with image upload
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.js        — Edit product form
│   └── api/
│       ├── products/route.js      — GET all products
│       ├── upload-product/route.js — POST create product
│       ├── edit-product/route.js   — PUT update product
│       ├── delete-product/route.js — DELETE product + images
│       ├── toggle-product/route.js — POST toggle visibility
│       ├── save-image/route.js     — POST save image URL to DB
│       ├── r2-presigned-url/route.js — POST get R2 upload URL
│       └── debug-storage/route.js  — GET storage debug info
├── lib/
│   ├── cloudinary.js              — Cloudinary upload/delete/URL utilities
│   ├── compressImage.js           — Client-side image compression
│   ├── r2Direct.js                — Browser-side R2 direct upload
│   ├── requireAuth.js             — Shared auth guard for API routes
│   └── supabase/
│       ├── server.js              — Server-side Supabase client
│       ├── client.js              — Browser-side Supabase client
│       ├── admin.js               — Service role Supabase client
│       └── middleware.js          — Middleware-specific Supabase client
└── proxy.js                       — Edge middleware (full auth enforcement)
```

---

## 32. Interview FAQ — Quick Answers

### Q: What is Brand 2 Brand?
**A**: A premium e-commerce catalogue for a physical fashion store in Visakhapatnam, India. Built with Next.js 16, Supabase (PostgreSQL), and Cloudinary. Uses WhatsApp instead of a payment gateway for order placement.

### Q: Why two separate apps instead of one?
**A**: Security isolation (customer site is public, admin has auth), independent deployment (admin changes don't rebuild customer site), different dependency profiles (admin needs AWS SDK, crypto), different caching strategies.

### Q: How does the order flow work without a payment gateway?
**A**: Customer adds items to cart → cart calculates discounts → generates a formatted WhatsApp message with full order details → opens WhatsApp with the store owner's number → owner confirms and handles payment offline.

### Q: How do you handle images?
**A**: Three layers: (1) Client-side compression to <200KB WebP using Canvas API, (2) Direct browser upload to Cloudinary bypassing the server, (3) Cloudinary CDN serves images with on-the-fly transformations (auto-format, auto-quality, resizing).

### Q: Why not use a payment gateway?
**A**: The store owner in Vizag preferred WhatsApp-based ordering — it matches how local customers already interact with shops. No need for PCI compliance, lower cost, personal touch.

### Q: How do you prevent unauthorized admin access?
**A**: Four layers: (1) Edge proxy validates JWT with Supabase servers, (2) Server-side layout checks auth, (3) Every API route uses requireAuth(), (4) Client-side listener auto-redirects on session expiry. All use getUser() not getSession() — server-validated, cannot be spoofed.

### Q: How does the atmosphere theming work?
**A**: Each category page sets CSS Custom Properties on `:root` via React Context. The entire UI responds automatically through `var(--atmosphere-bg)`, `var(--atmosphere-text)`, etc. The accessories page becomes dark with gold accents; clothing stays light with crimson.

### Q: What caching strategy do you use?
**A**: Three layers: (1) ISR with 2-hour revalidation for pages, (2) CDN Cache-Control headers with stale-while-revalidate, (3) React cache() for per-request query deduplication. Static assets cached for 1 year with immutable.

### Q: How do you handle SEO for a dynamic product catalogue?
**A**: Server-side rendering for all product pages (crawlable HTML), dynamic metadata per product (title, description, OG image), auto-generated sitemap.xml with all active products, proper heading hierarchy (single h1 per page), semantic HTML.

### Q: What happens if Supabase is down?
**A**: ISR-cached pages continue serving from Vercel CDN. Sitemap falls back to static pages only. The customer site degrades gracefully — no crash. Admin operations would fail with error messages.

### Q: Why did you use PostgreSQL arrays for sizes/colors?
**A**: Sizes and colours are simple string lists, not entities needing their own attributes (no price-per-size, no stock-per-colour). Arrays avoid unnecessary junction tables and N+1 queries. Supabase JS client handles them natively.

### Q: What's the VizagIntro?
**A**: A 10-act cinematic logo reveal using GSAP timeline and procedurally generated audio (Web Audio API). Plays once per session, respects prefers-reduced-motion, and auto-handles browser audio restrictions. The audio uses oscillators, noise, reverb, and compression — no audio files loaded.

### Q: How do you handle the Vercel free tier limits?
**A**: Images are unoptimized (bypass Vercel's 1000-image limit), ISR revalidation is conservative (fewer function invocations), CDN caching reduces origin hits, client-side compression reduces upload sizes, dual select queries reduce data transfer.

### Q: What's the product code system?
**A**: Auto-generated sequential codes (B2B-0001, B2B-0002...) generated server-side by querying the max existing code. Used in WhatsApp messages and physical store tags for easy reference.

### Q: How does the discount system work?
**A**: Category-level flat discounts (10% clothing, 10% footwear, 10% accessories) with subcategory overrides (15% for bags). Computed in real-time using a pure function (`computeCartTotals`) triggered via `useMemo` whenever cart items change. No server-side computation — purely client-side.

---

> **Last Updated**: July 2026
> **Total Source Files**: ~45 (excluding CSS, config, and generated files)
> **Total Lines of Custom Code**: ~6,000+ (excluding CSS)
> **CSS Lines**: ~3,200 (customer) + ~2,000 (admin) = ~5,200
> **Database Tables**: 4 (categories, subcategories, products, product_images)
> **API Routes**: 8 (admin side)
> **External Services**: Supabase, Cloudinary, Cloudflare R2, Vercel, WhatsApp Business API (via URL scheme)
