const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('d:/skplore-admin/node_modules/@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

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

async function main() {
  console.log('--- Starting Cloudflare R2 Upload of Product Images ---');

  // Clean test object
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: 'test/sample-shirt.jpg' }));
  } catch (e) {}

  // Fetch all product_images
  const { data: rows, error } = await supabase.from('product_images').select('*');
  if (error) throw error;

  console.log(`Found ${rows.length} product image rows in Supabase.`);

  let uploadedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawUrl = row.image_url;

    // Resolve local path
    let relPath = decodeURIComponent(rawUrl.replace(/^\//, '').replace(/\//g, path.sep));
    let fullPath = path.join('d:\\skplore\\public', relPath);

    if (!fs.existsSync(fullPath) && fullPath.includes('gadgets_hero.png')) {
      fullPath = fullPath.replace('gadgets_hero.png', 'gadgets-hero.png');
    }

    if (!fs.existsSync(fullPath)) {
      console.warn(`[SKIP] Local file not found: ${fullPath}`);
      continue;
    }

    // Determine S3 Key: clean path without leading slash, sanitize spaces
    let key = rawUrl.replace(/^\//, '');
    key = decodeURIComponent(key).replace(/\s+/g, '-');

    // Determine Content-Type
    let contentType = 'image/jpeg';
    if (fullPath.endsWith('.png')) contentType = 'image/png';
    else if (fullPath.endsWith('.webp')) contentType = 'image/webp';

    const fileBuffer = fs.readFileSync(fullPath);

    // Upload to Cloudflare R2
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }));

    uploadedCount++;

    // Public URL
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${key}`;

    // Update in Supabase
    const { error: updateErr } = await supabase
      .from('product_images')
      .update({ image_url: publicUrl })
      .eq('id', row.id);

    if (updateErr) {
      console.error(`Error updating Supabase row ${row.id}:`, updateErr);
    } else {
      updatedCount++;
    }

    if ((i + 1) % 10 === 0 || i === rows.length - 1) {
      console.log(`Progress: ${i + 1}/${rows.length} images processed...`);
    }
  }

  console.log('\n=== Upload & Sync Complete ===');
  console.log(`Uploaded to Cloudflare R2: ${uploadedCount}`);
  console.log(`Updated in Supabase Database: ${updatedCount}`);
}

main().catch(console.error);
