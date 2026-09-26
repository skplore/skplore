const { createClient } = require('@supabase/supabase-js');
const { products } = require('../src/data/products.js');

const SUPABASE_URL = 'https://skimedlufkytgemmdhsv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNraW1lZGx1Zmt5dGdlbW1kaHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI1ODk5MSwiZXhwIjoyMTA1ODM0OTkxfQ.meqETNvlTzIY4bh5Mej-IQekq1TrGQUrqLPr5GWZy0c';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function migrate() {
  console.log('--- Starting Migration of Dummy Data to Supabase ---');

  // 1. Fetch all categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) throw catErr;

  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });
  console.log('Categories found:', Object.keys(catMap));

  // 2. Ensure all needed subcategories exist
  const subcatsToAdd = [
    { category_id: catMap['clothing'], name: 'Hoodies', slug: 'hoodies' },
    { category_id: catMap['clothing'], name: 'Kurthas', slug: 'kurthas' },
    { category_id: catMap['footwear'], name: 'Shoes', slug: 'shoes' },
    { category_id: catMap['footwear'], name: 'Slides', slug: 'slides' },
    { category_id: catMap['footwear'], name: 'Casual', slug: 'casual' },
    { category_id: catMap['footwear'], name: 'Sports', slug: 'sports' },
  ];

  for (const sub of subcatsToAdd) {
    if (!sub.category_id) continue;
    const { data: existing } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', sub.category_id)
      .eq('slug', sub.slug)
      .maybeSingle();

    if (!existing) {
      const { data: created, error: subErr } = await supabase
        .from('subcategories')
        .insert(sub)
        .select()
        .single();
      if (subErr) {
        console.error('Error inserting subcategory', sub.name, subErr);
      } else {
        console.log(`Created subcategory: ${sub.name} (${sub.slug})`);
      }
    }
  }

  // 3. Re-fetch full category + subcategory map
  const { data: allCategories, error: allCatErr } = await supabase
    .from('categories')
    .select('id, slug, subcategories(id, slug, name)');
  if (allCatErr) throw allCatErr;

  const subMap = {}; // 'category_slug/subcategory_slug' -> subcategory_id
  allCategories.forEach(cat => {
    (cat.subcategories || []).forEach(sub => {
      subMap[`${cat.slug}/${sub.slug}`] = sub.id;
    });
  });

  console.log(`Subcategory mapping prepared (${Object.keys(subMap).length} subcategories available).`);

  // 4. Check existing products count in DB
  const { data: existingProducts } = await supabase.from('products').select('id, name');
  console.log(`Current products in DB: ${existingProducts?.length || 0}`);

  let insertedCount = 0;
  let imagesCount = 0;

  for (const p of products) {
    const subId = subMap[`${p.category}/${p.subcategory}`];
    if (!subId) {
      console.warn(`Could not find subcategory for ${p.category}/${p.subcategory} (Product: ${p.name})`);
      continue;
    }

    // Insert Product
    const productPayload = {
      name: p.name,
      brand: p.brand || 'Skplore',
      subcategory_id: subId,
      gender: p.gender || 'unisex',
      price: p.price,
      original_price: p.originalPrice || null,
      description: p.description || '',
      sizes: p.sizes || [],
      colors: p.colors || [],
      badge: p.badge || null,
      atmosphere_theme: p.atmosphere || 'default',
      is_active: true
    };

    const { data: insertedProduct, error: prodErr } = await supabase
      .from('products')
      .insert(productPayload)
      .select('id, name, product_code')
      .single();

    if (prodErr) {
      console.error(`Error inserting product ${p.name}:`, prodErr);
      continue;
    }

    insertedCount++;

    // Prepare color map from colorImages: { 'Black': 1, 'Navy': 2 } -> index to color
    const indexToColor = {};
    if (p.colorImages) {
      Object.entries(p.colorImages).forEach(([color, idx]) => {
        indexToColor[idx] = color;
      });
    }

    // Insert Product Images
    if (Array.isArray(p.images) && p.images.length > 0) {
      const imageRows = p.images.map((imgUrl, idx) => ({
        product_id: insertedProduct.id,
        image_url: imgUrl,
        display_order: idx,
        color_tag: indexToColor[idx] || null
      }));

      const { data: insertedImgs, error: imgErr } = await supabase
        .from('product_images')
        .insert(imageRows)
        .select();

      if (imgErr) {
        console.error(`Error inserting images for ${p.name}:`, imgErr);
      } else {
        imagesCount += (insertedImgs?.length || 0);
      }
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Total Products Migrated: ${insertedCount} / ${products.length}`);
  console.log(`Total Images Inserted: ${imagesCount}`);
}

migrate().catch(console.error);
