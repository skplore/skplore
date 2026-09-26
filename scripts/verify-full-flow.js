const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('d:/skplore-admin/node_modules/@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = 'https://skimedlufkytgemmdhsv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNraW1lZGx1Zmt5dGdlbW1kaHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI1ODk5MSwiZXhwIjoyMTA1ODM0OTkxfQ.meqETNvlTzIY4bh5Mej-IQekq1TrGQUrqLPr5GWZy0c';
const R2_BUCKET = 'skplore-images';
const R2_PUBLIC_DOMAIN = 'https://pub-147b6454958c46f3bfb564286d54ecf9.r2.dev';

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://ea52d760ee4c346e47bd6408d97c3b04.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '3e2165de106730cc976a4ff815f7fb57',
    secretAccessKey: 'e3054ec8a5b161dd3fb86288af324ffc3b293ddfab0949d70e87cf03ea61098e',
  },
});

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function httpGetStatus(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('=== END-TO-END SYSTEM INTEGRATION VERIFICATION ===\n');

  // Step 1: Subcategory & Category Check
  console.log('[1/6] Checking Category & Subcategory mapping in Supabase...');
  const { data: subcat, error: subErr } = await supabase
    .from('subcategories')
    .select('id, name, slug, categories(name, slug)')
    .eq('slug', 'shirts')
    .single();

  if (subErr || !subcat) throw new Error('Subcategory check failed: ' + subErr?.message);
  console.log(`  ✓ Found category "${subcat.categories.name}" (${subcat.categories.slug}) -> subcategory "${subcat.name}" (${subcat.slug})`);

  // Step 2: Next Product Code Calculation
  console.log('\n[2/6] Verifying SKP-XXXX Product Code generation...');
  const { data: existingCodes } = await supabase
    .from('products')
    .select('product_code')
    .like('product_code', 'SKP-%')
    .order('product_code', { ascending: false })
    .limit(1);

  let nextSeq = 1;
  if (existingCodes && existingCodes.length > 0 && existingCodes[0].product_code) {
    const lastCode = existingCodes[0].product_code;
    const lastNum = parseInt(lastCode.replace('SKP-', ''), 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }
  const expectedCode = `SKP-${String(nextSeq).padStart(4, '0')}`;
  console.log(`  ✓ Current highest code: ${existingCodes?.[0]?.product_code || 'none'}`);
  console.log(`  ✓ Next generated code will be: ${expectedCode}`);

  // Step 3: Cloudflare R2 Upload Test
  console.log('\n[3/6] Testing Cloudflare R2 Direct Upload & Public CDN serving...');
  const testKey = `products/test-audit/verification-check_${Date.now()}.png`;
  // Minimal valid 1x1 transparent PNG buffer
  const samplePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: testKey,
    Body: samplePng,
    ContentType: 'image/png'
  }));

  const testPublicUrl = `${R2_PUBLIC_DOMAIN}/${testKey}`;
  const cdnStatus = await httpGetStatus(testPublicUrl);
  if (cdnStatus !== 200) throw new Error(`Cloudflare CDN returned status ${cdnStatus} for ${testPublicUrl}`);
  console.log(`  ✓ Image successfully uploaded to R2: ${testKey}`);
  console.log(`  ✓ Public CDN verified reachable: ${testPublicUrl} (Status: ${cdnStatus})`);

  // Step 4: Create Product in Supabase (Admin Creation Simulation)
  console.log('\n[4/6] Creating test product row in Supabase...');
  const { data: newProd, error: insertErr } = await supabase
    .from('products')
    .insert({
      name: 'System Audit Test Shirt',
      brand: 'Skplore',
      subcategory_id: subcat.id,
      gender: 'men',
      price: 1999,
      original_price: 2999,
      description: 'End to end flow verification product.',
      sizes: ['M', 'L', 'XL'],
      colors: ['Midnight'],
      badge: 'NEW',
      atmosphere_theme: 'clothing',
      is_active: true,
      product_code: expectedCode
    })
    .select()
    .single();

  if (insertErr) throw new Error('Product insert failed: ' + insertErr.message);
  console.log(`  ✓ Product created successfully: ID ${newProd.id}, Code ${newProd.product_code}`);

  // Attach Image in product_images
  const { error: imgErr } = await supabase
    .from('product_images')
    .insert({
      product_id: newProd.id,
      image_url: testPublicUrl,
      display_order: 0,
      color_tag: 'Midnight'
    });
  if (imgErr) throw new Error('Image save failed: ' + imgErr.message);
  console.log(`  ✓ Image linked in product_images table`);

  // Step 5: Storefront Query Verification
  console.log('\n[5/6] Verifying Storefront Query retrieval...');
  const { data: queryResult, error: qErr } = await supabase
    .from('products')
    .select(`
      id, name, brand, gender, price, original_price, product_code,
      sizes, colors, badge, atmosphere_theme,
      subcategories ( id, name, slug, categories ( id, name, slug ) ),
      product_images ( id, image_url, display_order, color_tag )
    `)
    .eq('id', newProd.id)
    .single();

  if (qErr || !queryResult) throw new Error('Storefront query failed: ' + qErr?.message);
  console.log(`  ✓ Storefront successfully loaded product: "${queryResult.name}"`);
  console.log(`  ✓ Category: ${queryResult.subcategories.categories.name} > ${queryResult.subcategories.name}`);
  console.log(`  ✓ CDN Image: ${queryResult.product_images[0].image_url}`);

  // Step 6: Cleanup Test Data
  console.log('\n[6/6] Cleaning up test product & R2 storage object...');
  await supabase.from('products').delete().eq('id', newProd.id);
  await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: testKey }));
  console.log(`  ✓ Test product and Cloudflare R2 object cleaned up cleanly.`);

  console.log('\n=================================================');
  console.log('RESULT: ALL 6/6 SYSTEM FLOWS PASSED 100% PERFECTLY!');
  console.log('=================================================');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
