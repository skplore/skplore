const fs = require('fs');

console.log('--- Applying fixes to skplore-admin ---');

// 1. Fix products/new/page.js
const newPagePath = 'd:\\skplore-admin\\src\\app\\products\\new\\page.js';
let newPageContent = fs.readFileSync(newPagePath, 'utf8');

const oldNewPageBlock = `      let order = 0;
      if (coverImage?.file) {
        setUploadProgress('Uploading cover image to Cloudflare R2...');
        const coverUrl = await uploadToR2Direct(coverImage.file, 'cover');
        await fetch('/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, imageUrl: coverUrl, displayOrder: order++, colorTag: null }),
        });
      }

      for (let i = 0; i < variantImages.length; i++) {
        const v = variantImages[i];
        setUploadProgress(\`Uploading gallery image \${i + 1} of \${variantImages.length}...\`);
        const variantUrl = await uploadToR2Direct(v.file, \`variant-\${i + 1}\`);
        await fetch('/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, imageUrl: variantUrl, displayOrder: order++, colorTag: v.colorTag || null }),
        });
      }`;

const newNewPageBlock = `      let order = 0;
      const folder = \`products/\${productId}\`;

      if (coverImage?.file) {
        setUploadProgress('Uploading cover image to Cloudflare R2...');
        const ext = coverImage.file.name.split('.').pop() || 'webp';
        const coverResult = await uploadToR2Direct(coverImage.file, folder, \`cover_\${Date.now()}.\${ext}\`);
        await fetch('/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, imageUrl: coverResult.url, displayOrder: order++, colorTag: null }),
        });
      }

      for (let i = 0; i < variantImages.length; i++) {
        const v = variantImages[i];
        if (!v.file) continue;
        setUploadProgress(\`Uploading gallery image \${i + 1} of \${variantImages.length}...\`);
        const ext = v.file.name.split('.').pop() || 'webp';
        const variantResult = await uploadToR2Direct(v.file, folder, \`variant_\${Date.now()}_\${i + 1}.\${ext}\`);
        await fetch('/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, imageUrl: variantResult.url, displayOrder: order++, colorTag: v.colorTag || null }),
        });
      }`;

if (newPageContent.includes(oldNewPageBlock)) {
  newPageContent = newPageContent.replace(oldNewPageBlock, newNewPageBlock);
  fs.writeFileSync(newPagePath, newPageContent);
  console.log('1. Fixed products/new/page.js successfully!');
} else {
  console.warn('1. Warning: oldNewPageBlock not matched directly in products/new/page.js');
}

// 2. Fix api/upload-product/route.js (B2B- -> SKP-)
const uploadRoutePath = 'd:\\skplore-admin\\src\\app\\api\\upload-product\\route.js';
let uploadRouteContent = fs.readFileSync(uploadRoutePath, 'utf8');

const oldB2BBlock = `    // ── Generate unique product code (B2B-XXXX) ────────────
    // Query the max existing sequence number to avoid collisions
    const { data: existingCodes } = await supabase
      .from('products')
      .select('product_code')
      .like('product_code', 'B2B-%')
      .order('product_code', { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (existingCodes && existingCodes.length > 0 && existingCodes[0].product_code) {
      const lastCode = existingCodes[0].product_code; // e.g. "B2B-0042"
      const lastNum = parseInt(lastCode.replace('B2B-', ''), 10);
      if (!isNaN(lastNum)) nextSeq = lastNum + 1;
    }
    const productCode = \`B2B-\${String(nextSeq).padStart(4, '0')}\`;`;

const newSKPBlock = `    // ── Generate unique product code (SKP-XXXX) ────────────
    // Query the max existing sequence number to avoid collisions
    const { data: existingCodes } = await supabase
      .from('products')
      .select('product_code')
      .like('product_code', 'SKP-%')
      .order('product_code', { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (existingCodes && existingCodes.length > 0 && existingCodes[0].product_code) {
      const lastCode = existingCodes[0].product_code; // e.g. "SKP-0037"
      const lastNum = parseInt(lastCode.replace('SKP-', ''), 10);
      if (!isNaN(lastNum)) nextSeq = lastNum + 1;
    }
    const productCode = \`SKP-\${String(nextSeq).padStart(4, '0')}\`;`;

if (uploadRouteContent.includes(oldB2BBlock)) {
  uploadRouteContent = uploadRouteContent.replace(oldB2BBlock, newSKPBlock);
  fs.writeFileSync(uploadRoutePath, uploadRouteContent);
  console.log('2. Fixed api/upload-product/route.js to generate SKP-XXXX codes!');
} else {
  console.warn('2. Warning: oldB2BBlock not matched directly in upload-product/route.js');
}

// 3. Fix api/delete-product/route.js (handle R2 deletion)
const deleteRoutePath = 'd:\\skplore-admin\\src\\app\\api\\delete-product\\route.js';
let deleteRouteContent = fs.readFileSync(deleteRoutePath, 'utf8');

if (!deleteRouteContent.includes('isR2Url')) {
  deleteRouteContent = deleteRouteContent.replace(
    "import {\n  deleteFromCloudinary,",
    "import { isR2Url, extractR2Key, deleteFromR2 } from '@/lib/r2';\nimport {\n  deleteFromCloudinary,"
  );
  deleteRouteContent = deleteRouteContent.replace(
    "} else if (isSupabaseStorageUrl(img.image_url)) {",
    "} else if (isR2Url(img.image_url)) {\n            const key = extractR2Key(img.image_url);\n            if (key) await deleteFromR2(key);\n          } else if (isSupabaseStorageUrl(img.image_url)) {"
  );
  fs.writeFileSync(deleteRoutePath, deleteRouteContent);
  console.log('3. Fixed api/delete-product/route.js to clean up Cloudflare R2 images!');
}

// 4. Fix api/edit-product/route.js (handle R2 deletion)
const editRoutePath = 'd:\\skplore-admin\\src\\app\\api\\edit-product\\route.js';
let editRouteContent = fs.readFileSync(editRoutePath, 'utf8');

if (!editRouteContent.includes('isR2Url')) {
  editRouteContent = editRouteContent.replace(
    "import {\n  deleteFromCloudinary,",
    "import { isR2Url, extractR2Key, deleteFromR2 } from '@/lib/r2';\nimport {\n  deleteFromCloudinary,"
  );
  editRouteContent = editRouteContent.replace(
    "} else if (isSupabaseStorageUrl(img.image_url)) {",
    "} else if (isR2Url(img.image_url)) {\n            const key = extractR2Key(img.image_url);\n            if (key) await deleteFromR2(key);\n          } else if (isSupabaseStorageUrl(img.image_url)) {"
  );
  fs.writeFileSync(editRoutePath, editRouteContent);
  console.log('4. Fixed api/edit-product/route.js to clean up removed Cloudflare R2 images!');
}

// 5. Fix products/[id]/edit/page.js folder path (brand2brand/products -> products)
const editPagePath = 'd:\\skplore-admin\\src\\app\\products\\[id]\\edit\\page.js';
let editPageContent = fs.readFileSync(editPagePath, 'utf8');
if (editPageContent.includes("const folder = `brand2brand/products/${productId}`;")) {
  editPageContent = editPageContent.replace(
    "const folder = `brand2brand/products/${productId}`;",
    "const folder = `products/${productId}`;"
  );
  fs.writeFileSync(editPagePath, editPageContent);
  console.log('5. Fixed products/[id]/edit/page.js folder prefix to products/${productId}!');
}

console.log('--- All Admin Gaps Successfully Addressed ---');
