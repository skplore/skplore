const fs = require('fs');

const file = 'd:/skplore-admin/src/app/products/[id]/edit/page.js';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the limits loading block in load()
const startMarker = '// Fetch fresh, dynamic gadget limits';
const endMarker = 'setForm({';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newLoadingBlock = `// Multi-layer dynamic gadget limits fetch:
      // 1. Direct public storage CDN fetch with cache-busting (bypasses browser cache & proxy)
      // 2. /api/gadget-limits endpoint
      // 3. Direct supabase client storage download
      // 4. Native Postgres columns
      let minOrderQuantity = 1;
      let maxOrderQuantity = '';
      let stockQuantity = '';
      let limitsLoaded = false;

      // Layer 1: Direct public storage CDN fetch with cache-busting
      try {
        const sUrl = \`https://skimedlufkytgemmdhsv.supabase.co/storage/v1/object/public/store-config/gadget_quantities.json?t=\${Date.now()}\`;
        const sRes = await fetch(sUrl, { cache: 'no-store' });
        if (sRes.ok) {
          const sMap = await sRes.json();
          const pLimit = sMap && (sMap[productId] || sMap[productId.toLowerCase()]);
          if (pLimit) {
            if (pLimit.minOrderQuantity !== undefined && pLimit.minOrderQuantity !== null) {
              minOrderQuantity = pLimit.minOrderQuantity;
              limitsLoaded = true;
            }
            if (pLimit.maxOrderQuantity !== undefined && pLimit.maxOrderQuantity !== null) {
              maxOrderQuantity = pLimit.maxOrderQuantity;
              limitsLoaded = true;
            }
            if (pLimit.stockQuantity !== undefined && pLimit.stockQuantity !== null) {
              stockQuantity = pLimit.stockQuantity;
              limitsLoaded = true;
            }
          }
        }
      } catch (err) {
        console.warn('Storage limits fetch note:', err);
      }

      // Layer 2: API route
      if (!limitsLoaded) {
        try {
          const limitRes = await fetch(\`/api/gadget-limits?productId=\${productId}&_t=\${Date.now()}\`, {
            cache: 'no-store',
          });
          if (limitRes.ok) {
            const lData = await limitRes.json();
            if (lData.minOrderQuantity !== undefined && lData.minOrderQuantity !== null) {
              minOrderQuantity = lData.minOrderQuantity;
              limitsLoaded = true;
            }
            if (lData.maxOrderQuantity !== undefined && lData.maxOrderQuantity !== null) {
              maxOrderQuantity = lData.maxOrderQuantity;
              limitsLoaded = true;
            }
            if (lData.stockQuantity !== undefined && lData.stockQuantity !== null) {
              stockQuantity = lData.stockQuantity;
              limitsLoaded = true;
            }
          }
        } catch (err) {
          console.warn('/api/gadget-limits fetch note:', err);
        }
      }

      // Layer 3: Supabase client download
      if (!limitsLoaded) {
        try {
          const { data: qBlob } = await supabase.storage.from('store-config').download('gadget_quantities.json');
          if (qBlob) {
            const qMap = JSON.parse(await qBlob.text());
            const pLimit = qMap && (qMap[productId] || qMap[productId.toLowerCase()]);
            if (pLimit) {
              if (pLimit.minOrderQuantity !== undefined && pLimit.minOrderQuantity !== null) {
                minOrderQuantity = pLimit.minOrderQuantity;
              }
              if (pLimit.maxOrderQuantity !== undefined && pLimit.maxOrderQuantity !== null) {
                maxOrderQuantity = pLimit.maxOrderQuantity;
              }
              if (pLimit.stockQuantity !== undefined && pLimit.stockQuantity !== null) {
                stockQuantity = pLimit.stockQuantity;
              }
            }
          }
        } catch (err) {}
      }

      // Layer 4: Native Postgres columns
      if (product.min_order_quantity !== undefined && product.min_order_quantity !== null) {
        minOrderQuantity = product.min_order_quantity;
      }
      if (product.max_order_quantity !== undefined && product.max_order_quantity !== null) {
        maxOrderQuantity = product.max_order_quantity;
      }
      if (product.stock_quantity !== undefined && product.stock_quantity !== null) {
        stockQuantity = product.stock_quantity;
      }

      console.log('✅ Loaded product limits for edit:', { productId, minOrderQuantity, maxOrderQuantity, stockQuantity });

      `;

  content = content.slice(0, startIndex) + newLoadingBlock + content.slice(endIndex);
  console.log('Successfully updated loading block in edit page');
} else {
  console.error('Markers not found in edit page!');
}

// Ensure inputs have explicit handling for null and empty values
content = content.replace(
  "value={form.maxOrderQuantity || ''}",
  "value={form.maxOrderQuantity !== undefined && form.maxOrderQuantity !== null ? form.maxOrderQuantity : ''}"
);

content = content.replace(
  "value={form.stockQuantity !== undefined ? form.stockQuantity : ''}",
  "value={form.stockQuantity !== undefined && form.stockQuantity !== null ? form.stockQuantity : ''}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Saved updated edit page');
