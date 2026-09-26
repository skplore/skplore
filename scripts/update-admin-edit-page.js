const fs = require('fs');

const file = 'd:/skplore-admin/src/app/products/[id]/edit/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the load logic
const oldLoadTarget = `      // Load gadget limits from Supabase storage as fallback
      let qMeta = {};
      try {
        const { data: qData } = await supabase.storage.from('store-config').download('gadget_quantities.json');
        if (qData) qMeta = JSON.parse(await qData.text());
      } catch (e) {}

      const pLimit = (qMeta && qMeta[productId]) || {};
      const minOrderQuantity = (product.min_order_quantity !== undefined && product.min_order_quantity !== null)
        ? product.min_order_quantity
        : (pLimit.minOrderQuantity || 1);
      const maxOrderQuantity = (product.max_order_quantity !== undefined && product.max_order_quantity !== null)
        ? product.max_order_quantity
        : (pLimit.maxOrderQuantity !== undefined ? pLimit.maxOrderQuantity : '');
      const stockQuantity = (product.stock_quantity !== undefined && product.stock_quantity !== null)
        ? product.stock_quantity
        : (pLimit.stockQuantity !== undefined ? pLimit.stockQuantity : '');`;

const newLoadTarget = `      // Fetch fresh, dynamic gadget limits from server API (bypasses browser cache)
      let minOrderQuantity = 1;
      let maxOrderQuantity = '';
      let stockQuantity = '';

      try {
        const limitRes = await fetch(\`/api/gadget-limits?productId=\${productId}&_t=\${Date.now()}\`, {
          cache: 'no-store',
        });
        if (limitRes.ok) {
          const lData = await limitRes.json();
          if (lData.minOrderQuantity !== undefined && lData.minOrderQuantity !== null) {
            minOrderQuantity = lData.minOrderQuantity;
          }
          if (lData.maxOrderQuantity !== undefined && lData.maxOrderQuantity !== null) {
            maxOrderQuantity = lData.maxOrderQuantity;
          }
          if (lData.stockQuantity !== undefined && lData.stockQuantity !== null) {
            stockQuantity = lData.stockQuantity;
          }
        }
      } catch (err) {
        console.warn('Could not load gadget limits from /api/gadget-limits:', err);
      }

      // If Postgres has columns directly, prefer them if present
      if (product.min_order_quantity !== undefined && product.min_order_quantity !== null) {
        minOrderQuantity = product.min_order_quantity;
      }
      if (product.max_order_quantity !== undefined && product.max_order_quantity !== null) {
        maxOrderQuantity = product.max_order_quantity;
      }
      if (product.stock_quantity !== undefined && product.stock_quantity !== null) {
        stockQuantity = product.stock_quantity;
      }`;

if (content.includes(oldLoadTarget)) {
  content = content.replace(oldLoadTarget, newLoadTarget);
  console.log('Replaced load target successfully');
} else {
  console.log('oldLoadTarget not found directly, checking partial');
}

// Make sure inputs use clean value bindings
content = content.replace(
  "value={form.minOrderQuantity || 1}",
  "value={form.minOrderQuantity !== undefined && form.minOrderQuantity !== '' ? form.minOrderQuantity : 1}"
);

content = content.replace(
  "minOrderQuantity: form.minOrderQuantity || 1,",
  "minOrderQuantity: form.minOrderQuantity ? Math.max(1, parseInt(form.minOrderQuantity, 10)) : 1,"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Updated edit page successfully');
