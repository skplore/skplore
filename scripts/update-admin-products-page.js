const fs = require('fs');

const file = 'd:/skplore-admin/src/app/products/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Update fetchProducts to bypass cache
content = content.replace(
  "const res = await fetch('/api/products');",
  "const res = await fetch(`/api/products?_t=${Date.now()}`, { cache: 'no-store' });"
);

// If setGadgetQuantities isn't used after fetch, add it
if (!content.includes("setGadgetQuantities(json.gadgetQuantities)")) {
  content = content.replace(
    "setProducts(json.products || []);",
    "setProducts(json.products || []);\n        if (json.gadgetQuantities) setGadgetQuantities(json.gadgetQuantities);"
  );
}

// 2. Add Order Limits <td> in desktop table
const badgeTd = `                    <td>
                      {p.badge
                        ? <span className="admin-badge admin-badge-blue">{p.badge}</span>
                        : <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}
                    </td>`;

const orderLimitsTd = `                    <td>
                      {p.badge
                        ? <span className="admin-badge admin-badge-blue">{p.badge}</span>
                        : <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}
                    </td>
                    <td>
                      {(() => {
                        const isGadget = p.subcategories?.categories?.slug === 'gadgets' ||
                          p.subcategories?.categories?.name?.toLowerCase() === 'gadgets' ||
                          p.atmosphere_theme === 'gadgets';
                        const min = p.min_order_quantity || 1;
                        const max = p.max_order_quantity;
                        const stock = p.stock_quantity;
                        const hasCustomLimits = min > 1 || max !== null || stock !== null;

                        if (isGadget || hasCustomLimits) {
                          return (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: min > 1 ? '#dc2626' : '#334155',
                                background: min > 1 ? '#fee2e2' : '#f1f5f9',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                width: 'fit-content'
                              }}>
                                Min: {min}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>
                                Max: {max ? \`\${max}\` : '∞'} · Stock: {stock !== null && stock !== undefined ? stock : '—'}
                              </span>
                            </div>
                          );
                        }
                        return <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>—</span>;
                      })()}
                    </td>`;

if (content.includes(badgeTd) && !content.includes('const hasCustomLimits = min > 1')) {
  content = content.replace(badgeTd, orderLimitsTd);
  console.log('Added order limits <td> to desktop table');
}

// 3. Fix colSpan for empty table
content = content.replace('colSpan={7}', 'colSpan={9}');

// 4. Mobile card badge
const mobileMeta = `<div className="admin-mobile-card-meta">
                    <span className="admin-mobile-card-price">₹{p.price?.toLocaleString()}</span>
                    {p.badge && <span className="admin-badge admin-badge-blue">{p.badge}</span>}
                    <span className={\`admin-badge \${p.is_active ? 'admin-badge-green' : 'admin-badge-red'}\`}>`;

const mobileMetaWithLimits = `<div className="admin-mobile-card-meta">
                    <span className="admin-mobile-card-price">₹{p.price?.toLocaleString()}</span>
                    {p.badge && <span className="admin-badge admin-badge-blue">{p.badge}</span>}
                    {p.min_order_quantity > 1 && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '3px' }}>
                        Min: {p.min_order_quantity}
                      </span>
                    )}
                    <span className={\`admin-badge \${p.is_active ? 'admin-badge-green' : 'admin-badge-red'}\`}>`;

if (content.includes(mobileMeta)) {
  content = content.replace(mobileMeta, mobileMetaWithLimits);
  console.log('Added min order badge to mobile card');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated', file);
