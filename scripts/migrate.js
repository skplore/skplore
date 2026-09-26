/**
 * Skplore — Data Migration Script
 * 
 * Migrates local product data + images to Supabase.
 * Run: node scripts/migrate.js
 * 
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY set.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
  console.error('❌ Please set real Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// ─── Product data (copied inline to avoid ESM import issues with Next.js paths) ───
const products = [
  { id: 'shirt-001', name: 'Midnight Floral Print Shirt', brand: 'Skplore', category: 'clothing', subcategory: 'shirts', price: 1899, originalPrice: 2999, description: 'Premium cotton floral print shirt with a relaxed modern fit. Perfect for evening outings and casual gatherings.', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Navy'], badge: 'BESTSELLER', atmosphere: 'clothing', images: ['/products/shirts/1/652593437_17898996006407338_6629818373478168293_n.jpg','/products/shirts/1/653708450_17898995796407338_7117762134364532222_n.jpg','/products/shirts/1/653890948_17898995832407338_1447990606815323151_n.jpg'] },
  { id: 'shirt-002', name: 'Classic Striped Formal Shirt', brand: 'Skplore', category: 'clothing', subcategory: 'shirts', price: 1499, originalPrice: 2499, description: 'Tailored striped shirt in premium cotton. Clean lines and structured collar for a sophisticated look.', sizes: ['S','M','L','XL'], colors: ['White/Blue','White/Grey'], badge: null, atmosphere: 'clothing', images: ['/products/shirts/2/652079210_17898917031407338_6624973146843047815_n.jpg','/products/shirts/2/652772779_17898916962407338_2020798742231414796_n.jpg','/products/shirts/2/652774100_17898916944407338_1782183215977825139_n.jpg'] },
  { id: 'shirt-003', name: 'Botanical Garden Resort Shirt', brand: 'Skplore', category: 'clothing', subcategory: 'shirts', price: 2199, originalPrice: 3499, description: 'Tropical-inspired resort shirt with all-over botanical print. Lightweight fabric ideal for Vizag summers.', sizes: ['M','L','XL','XXL'], colors: ['White/Green','Cream/Blue'], badge: 'NEW', atmosphere: 'clothing', images: ['/products/shirts/3/651502232_17898511128407338_3961653521532903808_n.jpg','/products/shirts/3/651646487_17898511098407338_2235510785294967997_n.jpg','/products/shirts/3/651752674_17898511068407338_1128419072619679100_n.jpg'] },
  { id: 'shirt-004', name: 'Oxford Button-Down Classic', brand: 'Skplore', category: 'clothing', subcategory: 'shirts', price: 1699, originalPrice: null, description: 'Timeless Oxford button-down in premium cotton. A wardrobe essential for any gentleman.', sizes: ['S','M','L','XL'], colors: ['White','Light Blue','Pink'], badge: null, atmosphere: 'clothing', images: ['/products/shirts/4/649556360_17897947104407338_6319893587288100179_n.jpg','/products/shirts/4/649773913_17897947059407338_7777731556998918859_n.jpg','/products/shirts/4/650220944_17897947047407338_3452300984456669186_n.jpg'] },
  { id: 'shirt-005', name: 'Black Embroidered Statement Shirt', brand: 'Skplore', category: 'clothing', subcategory: 'shirts', price: 2499, originalPrice: 3999, description: 'Bold black shirt with intricate butterfly and floral embroidery. For the man who makes a statement.', sizes: ['M','L','XL'], colors: ['Black'], badge: 'TRENDING', atmosphere: 'clothing', images: ['/products/shirts/5/649403710_17897912421407338_3405813342588314246_n.jpg','/products/shirts/5/649847084_17897912367407338_7409692509874705074_n.jpg','/products/shirts/5/650134244_17897912397407338_7803089676417766917_n.jpg'] },
  { id: 'shirt-006', name: 'Pastel Linen Summer Shirt', brand: 'Skplore', category: 'clothing', subcategory: 'shirts', price: 1799, originalPrice: 2799, description: 'Breathable linen shirt in soft pastel tones. The perfect companion for beach walks at RK Beach.', sizes: ['S','M','L','XL','XXL'], colors: ['Mint','Peach','Sky Blue'], badge: null, atmosphere: 'clothing', images: ['/products/shirts/6/641330726_17896985091407338_8128616217468782635_n.jpg','/products/shirts/6/641771398_17896985085407338_3943083797370913406_n.jpg','/products/shirts/6/642500050_17896985076407338_8004424778753884120_n.jpg'] },
  { id: 'jeans-001', name: 'Distressed Charcoal Slim Fit', brand: 'Skplore', category: 'clothing', subcategory: 'jeans', price: 2299, originalPrice: 3499, description: 'Modern distressed jeans in charcoal wash. Slim fit with stretch comfort for all-day wear.', sizes: ['28','30','32','34','36'], colors: ['Charcoal'], badge: 'BESTSELLER', atmosphere: 'clothing', images: ['/products/jeans/1/650730237_17898653781407338_1684584722879861276_n.jpg','/products/jeans/1/651061685_17898653853407338_7314555725827964414_n.jpg','/products/jeans/1/651632102_17898653895407338_7391433155879392190_n.jpg'] },
  { id: 'jeans-002', name: 'Classic Indigo Straight Fit', brand: 'Skplore', category: 'clothing', subcategory: 'jeans', price: 1999, originalPrice: null, description: 'Classic indigo jeans with a straight-leg silhouette. Versatile enough for both casual and semi-formal occasions.', sizes: ['28','30','32','34','36','38'], colors: ['Dark Indigo','Medium Blue'], badge: null, atmosphere: 'clothing', images: ['/products/jeans/2/621386639_17891753571407338_4713682832581669159_n.jpg','/products/jeans/2/622113472_17891753622407338_7232810798027093273_n.jpg','/products/jeans/2/622254779_17891753631407338_3027813790584895536_n.jpg'] },
  { id: 'jeans-003', name: 'Ripped Knee Skinny Jeans', brand: 'Skplore', category: 'clothing', subcategory: 'jeans', price: 2499, originalPrice: 3999, description: 'Edgy skinny jeans with artful knee rips. Premium stretch denim for the fashion-forward man.', sizes: ['28','30','32','34'], colors: ['Black','Light Blue'], badge: 'TRENDING', atmosphere: 'clothing', images: ['/products/jeans/3/611249000_17889796719407338_2717939747655955892_n.jpg','/products/jeans/3/611292584_17889796767407338_7084810456017708497_n.jpg','/products/jeans/3/611678659_17889796710407338_4512478654306926527_n.jpg'] },
  { id: 'jeans-004', name: 'Washed Denim Relaxed Fit', brand: 'Skplore', category: 'clothing', subcategory: 'jeans', price: 2199, originalPrice: 3299, description: 'Relaxed-fit washed denim with a vintage vibe. Premium quality fabric for ultimate comfort.', sizes: ['30','32','34','36'], colors: ['Washed Blue'], badge: 'NEW', atmosphere: 'clothing', images: ['/products/jeans/4/610523916_17889087690407338_196443099719518210_n.jpg','/products/jeans/4/610622703_17889087681407338_3885442591387502714_n.jpg','/products/jeans/4/610833833_17889087699407338_5287642713699373401_n.jpg'] },
  { id: 'hoodie-001', name: 'Urban Street Hoodie', brand: 'Skplore', category: 'clothing', subcategory: 'hoodies', price: 2499, originalPrice: 3999, description: 'Premium quality street-style hoodie with a modern oversized fit. Soft fleece interior for maximum comfort.', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Grey'], badge: 'NEW', atmosphere: 'clothing', images: ['/products/hoodies/1/619893256_17891330793407338_5031916512463966049_n.jpg','/products/hoodies/1/621235687_17891330784407338_7764068102480186370_n.jpg','/products/hoodies/1/621349949_17891330811407338_4457054198515912694_n.jpg'] },
  { id: 'hoodie-002', name: 'Graphic Print Pullover Hoodie', brand: 'Skplore', category: 'clothing', subcategory: 'hoodies', price: 2799, originalPrice: 4499, description: 'Bold graphic print pullover hoodie. Kangaroo pocket and adjustable drawstring hood for everyday wear.', sizes: ['M','L','XL'], colors: ['Multi'], badge: 'TRENDING', atmosphere: 'clothing', images: ['/products/hoodies/2/619699425_17891340609407338_5590256109220610075_n.jpg','/products/hoodies/2/620521862_17891340645407338_4552293934859116938_n.jpg','/products/hoodies/2/621449349_17891340636407338_526524656617468674_n.jpg'] },
  { id: 'kurtha-001', name: 'Designer Ethnic Kurta', brand: 'Skplore', category: 'clothing', subcategory: 'kurthas', price: 1899, originalPrice: 2999, description: 'Elegant designer kurta blending ethnic roots with contemporary style. Perfect for festive occasions and traditional gatherings.', sizes: ['S','M','L','XL','XXL'], colors: ['Cream','Navy','Sage Green'], badge: 'EXCLUSIVE', atmosphere: 'clothing', images: ['/products/kurthas/1/648600484_17897780160407338_4467657135247055673_n.jpg','/products/kurthas/1/649222900_17897780214407338_5633338814343340117_n.jpg','/products/kurthas/1/649227484_17897780241407338_6665421347346239718_n.jpg'] },
  { id: 'foot-m-001', name: 'Urban Runner Sneakers', brand: 'Skplore', category: 'footwear', subcategory: 'shoes', gender: 'men', price: 3499, originalPrice: 4999, description: 'Lightweight urban sneakers with cushioned soles. Built for both style and comfort on Vizag streets.', sizes: ['7','8','9','10','11'], colors: ['White/Red','Black/Gold'], badge: 'BESTSELLER', atmosphere: 'footwear', images: ['/products/men-footwear/shoes/1/Screenshot%202026-03-29%20164422.png','/products/men-footwear/shoes/1/Screenshot%202026-03-29%20164530.png'] },
  { id: 'foot-m-002', name: 'Classic Sports Trainer', brand: 'Skplore', category: 'footwear', subcategory: 'shoes', gender: 'men', price: 3999, originalPrice: 5999, description: 'Performance training shoes with responsive cushioning and breathable mesh upper.', sizes: ['7','8','9','10'], colors: ['Red/Black','Blue/White'], badge: 'TRENDING', atmosphere: 'footwear', images: ['/products/men-footwear/shoes/2/Screenshot%202026-03-29%20164604.png','/products/men-footwear/shoes/2/Screenshot%202026-03-29%20164653.png'] },
  { id: 'foot-m-003', name: 'Premium Lifestyle Sneakers', brand: 'Skplore', category: 'footwear', subcategory: 'shoes', gender: 'men', price: 4499, originalPrice: 6499, description: 'Bold lifestyle sneakers with premium finish. For the fearless trendsetter who stands out.', sizes: ['7','8','9','10','11'], colors: ['Multi'], badge: null, atmosphere: 'footwear', images: ['/products/men-footwear/shoes/3/Screenshot%202026-03-29%20164741.png','/products/men-footwear/shoes/3/Screenshot%202026-03-29%20164755.png','/products/men-footwear/shoes/3/Screenshot%202026-03-29%20164812.png'] },
  { id: 'foot-m-004', name: 'Comfort Slide Sandals', brand: 'Skplore', category: 'footwear', subcategory: 'slides', gender: 'men', price: 1299, originalPrice: 1999, description: 'Ultra-comfortable slide sandals with cushioned footbed. Perfect for casual outings and beach days.', sizes: ['7','8','9','10','11'], colors: ['Black','Navy'], badge: null, atmosphere: 'footwear', images: ['/products/men-footwear/slides/1/Screenshot%202026-03-29%20164907.png','/products/men-footwear/slides/1/Screenshot%202026-03-29%20164923.png','/products/men-footwear/slides/1/Screenshot%202026-03-29%20164930.png'] },
  { id: 'foot-m-005', name: 'Premium Logo Slides', brand: 'Skplore', category: 'footwear', subcategory: 'slides', gender: 'men', price: 1499, originalPrice: 2499, description: 'Premium branded slides with textured sole and logo emboss. Lightweight and durable.', sizes: ['7','8','9','10'], colors: ['Black/Red','White'], badge: 'NEW', atmosphere: 'footwear', images: ['/products/men-footwear/slides/2/Screenshot%202026-03-29%20165029.png','/products/men-footwear/slides/2/Screenshot%202026-03-29%20165033.png','/products/men-footwear/slides/2/Screenshot%202026-03-29%20165048.png'] },
  { id: 'foot-w-001', name: 'Pastel Cloud Runners', brand: 'Skplore', category: 'footwear', subcategory: 'casual', gender: 'women', price: 2999, originalPrice: 4499, description: 'Ultra-lightweight runners in dreamy pastel shades. Cloud-like comfort for everyday wear.', sizes: ['5','6','7','8'], colors: ['Pink/White','Lavender/Grey'], badge: 'NEW', atmosphere: 'footwear', images: ['/products/women-footwear/1/482761558_17859811380367886_1368309460049346498_n.jpg','/products/women-footwear/1/482822600_17859811362367886_4719970564663976312_n.jpg','/products/women-footwear/1/482825858_17859811353367886_503780173478954933_n.jpg'] },
  { id: 'foot-w-002', name: 'Canvas Printed Slip-Ons', brand: 'Skplore', category: 'footwear', subcategory: 'casual', gender: 'women', price: 1799, originalPrice: 2999, description: 'Vibrant printed canvas slip-ons. Effortless style for casual outings.', sizes: ['5','6','7','8'], colors: ['Floral','Abstract'], badge: null, atmosphere: 'footwear', images: ['/products/women-footwear/2/481204552_17858703837367886_1575731551976373224_n.jpg','/products/women-footwear/2/481686485_17858703867367886_6842924061356850442_n.jpg','/products/women-footwear/2/481877001_17858703855367886_6906692105625158370_n.jpg'] },
  { id: 'foot-w-003', name: 'Flex Motion Sports Shoe', brand: 'Skplore', category: 'footwear', subcategory: 'sports', gender: 'women', price: 3499, originalPrice: 4999, description: 'Dynamic sports shoes with flex-motion technology. Designed for active lifestyles.', sizes: ['5','6','7','8'], colors: ['Teal/White','Pink/Black'], badge: 'TRENDING', atmosphere: 'footwear', images: ['/products/women-footwear/3/476611577_17856356457367886_3281942688952236433_n.jpg','/products/women-footwear/3/476669871_17856356475367886_8201040391479122935_n.jpg','/products/women-footwear/3/476753455_17856356466367886_4455089896147586607_n.jpg'] },
  { id: 'watch-m-001', name: 'Skeleton Dial Luxury Watch', brand: 'Premium Collection', category: 'accessories', subcategory: 'watches', gender: 'men', price: 12999, originalPrice: 19999, description: 'Exquisite skeleton dial mechanical watch with rose gold case.', sizes: ['One Size'], colors: ['Rose Gold'], badge: 'EXCLUSIVE', atmosphere: 'accessories', images: ['/products/men-watches/1/503587610_17867286039407338_1906862732559694388_n.jpg','/products/men-watches/1/514996708_17867286030407338_1565399906431850787_n.jpg','/products/men-watches/1/515012618_17867286048407338_5487718430230671784_n.jpg'] },
  { id: 'watch-m-002', name: 'Chronograph Sports Watch', brand: 'Premium Collection', category: 'accessories', subcategory: 'watches', gender: 'men', price: 8999, originalPrice: 14999, description: 'Multi-function chronograph with water resistance. Precision timing meets rugged durability.', sizes: ['One Size'], colors: ['Silver/Blue','Black'], badge: null, atmosphere: 'accessories', images: ['/products/men-watches/2/514677846_17867168292407338_2816860666345165928_n.jpg','/products/men-watches/2/514911170_17867168283407338_3571312622933784113_n.jpg','/products/men-watches/2/515446558_17867168253407338_6412254788332877398_n.jpg'] },
  { id: 'watch-m-003', name: 'Minimalist Leather Strap Watch', brand: 'Premium Collection', category: 'accessories', subcategory: 'watches', gender: 'men', price: 5999, originalPrice: 8999, description: 'Clean, minimalist dial with genuine leather strap. Understated elegance for the modern professional.', sizes: ['One Size'], colors: ['Brown/White','Black/Black'], badge: null, atmosphere: 'accessories', images: ['/products/men-watches/3/Screenshot%202026-03-29%20163814.png','/products/men-watches/3/Screenshot%202026-03-29%20163902.png'] },
  { id: 'watch-w-001', name: 'Rose Gold Elegance Watch', brand: 'Premium Collection', category: 'accessories', subcategory: 'watches', gender: 'women', price: 7999, originalPrice: 12999, description: "Elegant rose gold women's watch with crystal-studded bezel.", sizes: ['One Size'], colors: ['Rose Gold'], badge: 'EXCLUSIVE', atmosphere: 'accessories', images: ['/products/women-watches/1/506348462_17864932968407338_1083202475761799701_n.jpg','/products/women-watches/1/508164113_17864932941407338_2846148449153356628_n.jpg','/products/women-watches/1/508209824_17864932959407338_8710016381696563988_n.jpg'] },
  { id: 'watch-w-002', name: 'Bracelet Style Fashion Watch', brand: 'Premium Collection', category: 'accessories', subcategory: 'watches', gender: 'women', price: 5999, originalPrice: 8999, description: 'Chic bracelet-style fashion watch. Doubles as a stunning accessory for any occasion.', sizes: ['One Size'], colors: ['Silver','Gold'], badge: 'NEW', atmosphere: 'accessories', images: ['/products/women-watches/2/Screenshot%202026-03-29%20164105.png'] },
  { id: 'bag-001', name: 'Premium Leather Tote Bag', brand: 'Skplore', category: 'accessories', subcategory: 'bags', price: 6999, originalPrice: 9999, description: 'Stunning premium leather tote bag with spacious interior. Italian-inspired design meets everyday functionality.', sizes: ['One Size'], colors: ['Beige/Multi'], badge: 'EXCLUSIVE', atmosphere: 'accessories', images: ['/products/accessories-bags/bags/Screenshot%202026-03-29%20165647.png','/products/accessories-bags/bags/Screenshot%202026-03-29%20165737.png'] },
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function migrate() {
  console.log('🚀 Starting Skplore migration...\n');

  // 1. Extract unique categories and subcategories
  const categoryMap = {};
  for (const p of products) {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = new Set();
    }
    categoryMap[p.category].add(p.subcategory);
  }

  // 2. Insert categories
  const categoryIdMap = {};
  for (const catName of Object.keys(categoryMap)) {
    const slug = slugify(catName);
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name: catName.charAt(0).toUpperCase() + catName.slice(1), slug }, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Category "${catName}":`, error.message);
      continue;
    }
    categoryIdMap[catName] = data.id;
    console.log(`✅ Category: ${data.name} (${data.id})`);
  }

  // 3. Insert subcategories
  const subIdMap = {};
  for (const [catName, subs] of Object.entries(categoryMap)) {
    for (const subName of subs) {
      const slug = slugify(subName);
      const key = `${catName}/${subName}`;
      const { data, error } = await supabase
        .from('subcategories')
        .upsert(
          { category_id: categoryIdMap[catName], name: subName.charAt(0).toUpperCase() + subName.slice(1), slug },
          { onConflict: 'category_id,slug' }
        )
        .select()
        .single();

      if (error) {
        console.error(`❌ Subcategory "${key}":`, error.message);
        continue;
      }
      subIdMap[key] = data.id;
      console.log(`  ✅ Subcategory: ${data.name} (${data.id})`);
    }
  }

  // 4. Upload images & insert products
  const publicDir = path.resolve(__dirname, '..', 'public');
  let totalImages = 0;

  for (const p of products) {
    const subKey = `${p.category}/${p.subcategory}`;
    const subcategoryId = subIdMap[subKey];

    if (!subcategoryId) {
      console.error(`❌ No subcategory ID for ${subKey}, skipping ${p.name}`);
      continue;
    }

    // Insert product
    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .insert({
        name: p.name,
        brand: p.brand,
        subcategory_id: subcategoryId,
        gender: p.gender || null,
        price: p.price,
        original_price: p.originalPrice || null,
        description: p.description,
        sizes: p.sizes,
        colors: p.colors,
        badge: p.badge || null,
        atmosphere_theme: p.atmosphere || 'default',
        is_active: true,
      })
      .select()
      .single();

    if (prodErr) {
      console.error(`❌ Product "${p.name}":`, prodErr.message);
      continue;
    }

    console.log(`\n📦 Product: ${prod.name} (${prod.id})`);

    // Upload images
    for (let i = 0; i < p.images.length; i++) {
      const imgPath = decodeURIComponent(p.images[i]);
      const localFile = path.join(publicDir, imgPath);

      if (!fs.existsSync(localFile)) {
        console.warn(`   ⚠️  Image not found: ${localFile}`);
        // Insert with the local path as fallback
        await supabase.from('product_images').insert({
          product_id: prod.id,
          image_url: p.images[i],
          display_order: i,
        });
        totalImages++;
        continue;
      }

      const fileBuffer = fs.readFileSync(localFile);
      const ext = path.extname(localFile).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
      const storagePath = `${p.category}/${p.subcategory}/${prod.id}/${i}${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadErr) {
        console.warn(`   ⚠️  Upload failed for ${storagePath}: ${uploadErr.message}`);
        // Fallback to local path
        await supabase.from('product_images').insert({
          product_id: prod.id,
          image_url: p.images[i],
          display_order: i,
        });
      } else {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(storagePath);

        await supabase.from('product_images').insert({
          product_id: prod.id,
          image_url: urlData.publicUrl,
          display_order: i,
        });
        console.log(`   🖼️  Image ${i + 1}: uploaded`);
      }
      totalImages++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Migration Complete!');
  console.log(`   Categories: ${Object.keys(categoryIdMap).length}`);
  console.log(`   Subcategories: ${Object.keys(subIdMap).length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Images: ${totalImages}`);
  console.log('═'.repeat(50));
}

migrate().catch(console.error);
