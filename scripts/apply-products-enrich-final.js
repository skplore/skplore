const fs = require('fs');
const file = 'd:/skplore-admin/src/app/products/page.js';
let content = fs.readFileSync(file, 'utf8');

const start = content.indexOf('  const fetchProducts = useCallback(async () => {');
const end = content.indexOf('  useEffect(() => { fetchProducts(); }, [fetchProducts]);');

const newCode = `  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(\`/api/products?_t=\${Date.now()}\`, { cache: 'no-store' });
      let prods = [];
      let gMap = {};

      if (res.ok) {
        const json = await res.json();
        prods = json.products || [];
        gMap = json.gadgetQuantities || {};
      }

      // Guarantee freshest limits directly from public storage CDN
      try {
        const sUrl = \`https://skimedlufkytgemmdhsv.supabase.co/storage/v1/object/public/store-config/gadget_quantities.json?t=\${Date.now()}\`;
        const sRes = await fetch(sUrl, { cache: 'no-store' });
        if (sRes.ok) {
          const freshMap = await sRes.json();
          gMap = { ...gMap, ...freshMap };
        }
      } catch (e) {}

      const enriched = prods.map(p => {
        const limit = gMap[p.id] || gMap[p.id?.toLowerCase()] || {};
        return {
          ...p,
          min_order_quantity: limit.minOrderQuantity !== undefined ? limit.minOrderQuantity : (p.min_order_quantity || 1),
          max_order_quantity: limit.maxOrderQuantity !== undefined ? limit.maxOrderQuantity : (p.max_order_quantity || null),
          stock_quantity: limit.stockQuantity !== undefined ? limit.stockQuantity : (p.stock_quantity || null),
        };
      });

      setProducts(enriched);
      setGadgetQuantities(gMap);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

`;

content = content.slice(0, start) + newCode + content.slice(end);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated products/page.js');
