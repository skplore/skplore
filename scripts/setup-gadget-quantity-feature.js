const fs = require('fs');
const path = require('path');

const adminDir = path.resolve(__dirname, '../../skplore-admin');
console.log('Target admin dir:', adminDir);

if (!fs.existsSync(adminDir)) {
  console.error('Admin directory does not exist at:', adminDir);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// 1. UPDATE upload-product/route.js
// ─────────────────────────────────────────────────────────────
const uploadRoutePath = path.join(adminDir, 'src/app/api/upload-product/route.js');
let uploadRouteContent = fs.readFileSync(uploadRoutePath, 'utf8');

const updatedUploadRoute = `/**
 * /api/upload-product
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a new product row in the database.
 * 
 * Supports dynamic gadget ordering limits (minOrderQuantity, maxOrderQuantity,
 * stockQuantity) with dual-layer persistence (PostgreSQL + store-config storage).
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request) {
  try {
    // ── Auth guard ─────────────────────────────────────────────────────────
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const supabase = createAdminClient();
    const body = await request.json();

    // ── Extract product fields ──────────────────────────────
    const name          = body.name;
    const brand         = body.brand || 'Skplore';
    const subcategoryId = body.subcategoryId;
    const gender        = body.gender || null;
    const price         = parseInt(body.price);
    const originalPrice = body.originalPrice ? parseInt(body.originalPrice) : null;
    const description   = body.description || null;
    const sizes         = body.sizes || [];
    const colors        = body.colors || [];
    const badge         = body.badge || null;
    const atmosphereTheme = body.atmosphereTheme || 'default';

    // ── Gadget quantity & stock limits ──────────────────────
    const minOrderQuantity = body.minOrderQuantity ? Math.max(1, parseInt(body.minOrderQuantity, 10)) : 1;
    const maxOrderQuantity = body.maxOrderQuantity ? parseInt(body.maxOrderQuantity, 10) : null;
    const stockQuantity    = (body.stockQuantity !== null && body.stockQuantity !== undefined && body.stockQuantity !== '')
      ? parseInt(body.stockQuantity, 10)
      : null;

    if (!name || !price || !subcategoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Generate unique product code (SKP-XXXX) ────────────
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
    const productCode = \`SKP-\${String(nextSeq).padStart(4, '0')}\`;

    // ── Insert product row ──────────────────────────────────
    const insertPayload = {
      name,
      brand,
      subcategory_id: subcategoryId,
      gender,
      price,
      original_price: originalPrice,
      description,
      sizes,
      colors,
      badge,
      atmosphere_theme: atmosphereTheme,
      is_active: true,
      product_code: productCode,
      min_order_quantity: minOrderQuantity,
      max_order_quantity: maxOrderQuantity,
      stock_quantity: stockQuantity,
    };

    let { data: product, error: prodErr } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    // If native columns do not exist yet in Postgres, fallback and insert without them
    if (prodErr && (prodErr.code === '42703' || prodErr.message?.includes('column'))) {
      delete insertPayload.min_order_quantity;
      delete insertPayload.max_order_quantity;
      delete insertPayload.stock_quantity;
      const retry = await supabase
        .from('products')
        .insert(insertPayload)
        .select()
        .single();
      product = retry.data;
      prodErr = retry.error;
    }

    if (prodErr) {
      console.error('Product insert error:', prodErr);
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    // ── Dual-layer persistence: update store-config/gadget_quantities.json ──
    if (product?.id) {
      try {
        const { data: qData } = await supabase.storage.from('store-config').download('gadget_quantities.json');
        let qMap = {};
        if (qData) {
          try { qMap = JSON.parse(await qData.text()); } catch (e) {}
        }
        qMap[product.id] = { minOrderQuantity, maxOrderQuantity, stockQuantity };
        await supabase.storage.from('store-config').upload('gadget_quantities.json', JSON.stringify(qMap, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });
      } catch (err) {
        console.warn('Could not update gadget_quantities.json storage:', err.message);
      }
    }

    console.log(\`✅ Product created: \${product.id} — "\${name}" [\${productCode}] (Min: \${minOrderQuantity}, Max: \${maxOrderQuantity || '∞'}, Stock: \${stockQuantity || '—'})\`);

    return NextResponse.json({ productId: product.id, productCode });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;

fs.writeFileSync(uploadRoutePath, updatedUploadRoute, 'utf8');
console.log('✅ Updated upload-product/route.js');

// ─────────────────────────────────────────────────────────────
// 2. UPDATE edit-product/route.js
// ─────────────────────────────────────────────────────────────
const editRoutePath = path.join(adminDir, 'src/app/api/edit-product/route.js');
const updatedEditRoute = `/**
 * /api/edit-product
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates an existing product's metadata and handles image deletions.
 * Supports dynamic gadget ordering limits (minOrderQuantity, maxOrderQuantity, stockQuantity).
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/requireAuth';
import {
  deleteFromCloudinary,
  extractPublicId,
  isCloudinaryUrl,
  isSupabaseStorageUrl,
  extractSupabaseStoragePath,
} from '@/lib/cloudinary';

export async function PUT(request) {
  try {
    // ── Auth guard ─────────────────────────────────────────────────────────
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const supabase = createAdminClient();
    const body = await request.json();

    const productId     = body.productId;
    const name          = body.name;
    const brand         = body.brand || 'Skplore';
    const subcategoryId = body.subcategoryId;
    const gender        = body.gender || null;
    const price         = parseInt(body.price);
    const originalPrice = body.originalPrice ? parseInt(body.originalPrice) : null;
    const description   = body.description || null;
    const sizes         = body.sizes || [];
    const colors        = body.colors || [];
    const badge         = body.badge || null;
    const atmosphereTheme = body.atmosphereTheme || 'default';
    const removedImageIds = body.removedImageIds || [];

    // ── Gadget quantity & stock limits ──────────────────────
    const minOrderQuantity = body.minOrderQuantity ? Math.max(1, parseInt(body.minOrderQuantity, 10)) : 1;
    const maxOrderQuantity = body.maxOrderQuantity ? parseInt(body.maxOrderQuantity, 10) : null;
    const stockQuantity    = (body.stockQuantity !== null && body.stockQuantity !== undefined && body.stockQuantity !== '')
      ? parseInt(body.stockQuantity, 10)
      : null;

    if (!productId || !name || !price || !subcategoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Update product row ──────────────────────────────────
    const updatePayload = {
      name, brand, subcategory_id: subcategoryId, gender, price,
      original_price: originalPrice, description, sizes, colors,
      badge, atmosphere_theme: atmosphereTheme,
      min_order_quantity: minOrderQuantity,
      max_order_quantity: maxOrderQuantity,
      stock_quantity: stockQuantity,
    };

    let { error: updateErr } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    // Fallback if columns not yet added to Postgres table
    if (updateErr && (updateErr.code === '42703' || updateErr.message?.includes('column'))) {
      delete updatePayload.min_order_quantity;
      delete updatePayload.max_order_quantity;
      delete updatePayload.stock_quantity;
      const retry = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId);
      updateErr = retry.error;
    }

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    // ── Dual-layer persistence: update store-config/gadget_quantities.json ──
    try {
      const { data: qData } = await supabase.storage.from('store-config').download('gadget_quantities.json');
      let qMap = {};
      if (qData) {
        try { qMap = JSON.parse(await qData.text()); } catch (e) {}
      }
      qMap[productId] = { minOrderQuantity, maxOrderQuantity, stockQuantity };
      await supabase.storage.from('store-config').upload('gadget_quantities.json', JSON.stringify(qMap, null, 2), {
        upsert: true,
        contentType: 'application/json',
      });
    } catch (err) {
      console.warn('Could not update gadget_quantities.json storage:', err.message);
    }

    console.log(\`✅ Product updated: \${productId} — "\${name}" (Min: \${minOrderQuantity}, Max: \${maxOrderQuantity || '∞'}, Stock: \${stockQuantity || '—'})\`);

    const imageResults = { deleted: 0 };

    // ── Remove deleted images ───────────────────────────────
    for (const imgId of removedImageIds) {
      const { data: img } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('id', imgId)
        .single();

      if (img?.image_url) {
        try {
          if (isCloudinaryUrl(img.image_url)) {
            const publicId = extractPublicId(img.image_url);
            if (publicId) await deleteFromCloudinary(publicId);
          } else if (isSupabaseStorageUrl(img.image_url)) {
            const storagePath = extractSupabaseStoragePath(img.image_url);
            if (storagePath) await supabase.storage.from('product-images').remove([storagePath]);
          }
        } catch (err) {
          console.error('Image delete error:', err.message);
        }
      }
      await supabase.from('product_images').delete().eq('id', imgId);
      imageResults.deleted++;
    }

    return NextResponse.json({ success: true, images: imageResults });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;

fs.writeFileSync(editRoutePath, updatedEditRoute, 'utf8');
console.log('✅ Updated edit-product/route.js');

// ─────────────────────────────────────────────────────────────
// 3. UPDATE products/new/page.js
// ─────────────────────────────────────────────────────────────
const newPagePath = path.join(adminDir, 'src/app/products/new/page.js');
let newPageContent = fs.readFileSync(newPagePath, 'utf8');

// Ensure minOrderQuantity, maxOrderQuantity, stockQuantity in initial state
if (!newPageContent.includes('minOrderQuantity')) {
  newPageContent = newPageContent.replace(
    /atmosphereTheme:\s*'default',/g,
    "atmosphereTheme: 'default', minOrderQuantity: 1, maxOrderQuantity: '', stockQuantity: '',"
  );
  newPageContent = newPageContent.replace(
    /atmosphereTheme:\s*'clothing',/g,
    "atmosphereTheme: 'clothing', minOrderQuantity: 1, maxOrderQuantity: '', stockQuantity: '',"
  );
}

// In handleSubmit, include these in JSON.stringify
if (!newPageContent.includes('minOrderQuantity: form.minOrderQuantity')) {
  newPageContent = newPageContent.replace(
    /badge:\s*form\.badge\s*\|\|\s*null,\s*atmosphereTheme:\s*form\.atmosphereTheme,/g,
    `badge: form.badge || null,
          atmosphereTheme: form.atmosphereTheme,
          minOrderQuantity: form.minOrderQuantity || 1,
          maxOrderQuantity: form.maxOrderQuantity || null,
          stockQuantity: form.stockQuantity !== '' ? form.stockQuantity : null,`
  );
}

// Add the UI section for Gadget Order Quantity & Stock Limits
const gadgetQuantityUISection = `
        {/* ── SECTION: Order Quantity & Stock Limits ── */}
        <div className="admin-form-section" style={{
          borderLeft: isGadget ? '4px solid #6366f1' : '1px solid var(--admin-border)',
          background: isGadget ? 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, rgba(255,255,255,0) 100%)' : 'transparent',
        }}>
          <div className="admin-form-section-title">
            <span className="admin-form-section-num" style={{ background: isGadget ? '#6366f1' : undefined, color: isGadget ? '#fff' : undefined }}>
              ⚡
            </span>
            Gadget Order Quantity &amp; Stock Limits
            {isGadget && <span className="admin-form-section-hint" style={{ color: '#6366f1', fontWeight: 600 }}>— Active for Gadgets</span>}
          </div>
          <div className="admin-form-section-body">
            <p className="admin-hint-text" style={{ marginBottom: '16px' }}>
              Set dynamic ordering rules. Customers will not be allowed to select or place an order below the minimum or above the upper limit / total available stock.
            </p>

            <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Minimum Order Quantity *
                  <span style={{ fontSize: '11px', color: '#6366f1', marginLeft: '6px' }}>
                    (Default starts here)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="admin-form-input"
                  value={form.minOrderQuantity || 1}
                  onChange={e => handleChange('minOrderQuantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                  placeholder="e.g. 3"
                  required
                />
                <span className="admin-field-hint" style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  Customer cannot order less than this amount.
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Upper Limit / Max Order
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginLeft: '6px' }}>
                    (Optional)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="admin-form-input"
                  value={form.maxOrderQuantity || ''}
                  onChange={e => handleChange('maxOrderQuantity', e.target.value ? Math.max(1, parseInt(e.target.value, 10) || 1) : '')}
                  placeholder="e.g. 10 (Leave blank for no max limit)"
                />
                <span className="admin-field-hint" style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  Maximum units customer can buy in a single order.
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Total Available Quantity / Stock
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginLeft: '6px' }}>
                    (Optional)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="admin-form-input"
                  value={form.stockQuantity !== undefined ? form.stockQuantity : ''}
                  onChange={e => handleChange('stockQuantity', e.target.value !== '' ? Math.max(0, parseInt(e.target.value, 10) || 0) : '')}
                  placeholder="e.g. 50 (Total units available)"
                />
                <span className="admin-field-hint" style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  Total units currently available in store.
                </span>
              </div>
            </div>

            {/* Live Interactive Range Preview */}
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '6px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div style={{ fontSize: '13px', color: '#1e293b' }}>
                🛒 <strong>Live Order Range Preview:</strong> Customers can order between{' '}
                <strong style={{ color: '#dc2626' }}>{form.minOrderQuantity || 1} units</strong> and{' '}
                <strong style={{ color: '#2563eb' }}>
                  {form.maxOrderQuantity && form.stockQuantity
                    ? \`\${Math.min(form.maxOrderQuantity, form.stockQuantity)} units\`
                    : (form.maxOrderQuantity ? \`\${form.maxOrderQuantity} units\` : (form.stockQuantity ? \`\${form.stockQuantity} units\` : 'No upper limit'))}
                </strong>.
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Default selector on website will open at: <strong>{form.minOrderQuantity || 1}</strong>
              </span>
            </div>
          </div>
        </div>
`;

if (!newPageContent.includes('Gadget Order Quantity &amp; Stock Limits')) {
  // Place before Section 3: Sizes
  newPageContent = newPageContent.replace(
    '        {/* ── SECTION 3: Sizes ── */}',
    `${gadgetQuantityUISection}\n        {/* ── SECTION 3: Sizes ── */}`
  );
}

fs.writeFileSync(newPagePath, newPageContent, 'utf8');
console.log('✅ Updated products/new/page.js');

// ─────────────────────────────────────────────────────────────
// 4. UPDATE products/[id]/edit/page.js
// ─────────────────────────────────────────────────────────────
const editPagePath = path.join(adminDir, 'src/app/products/[id]/edit/page.js');
let editPageContent = fs.readFileSync(editPagePath, 'utf8');

// Ensure minOrderQuantity, maxOrderQuantity, stockQuantity in state and load
if (!editPageContent.includes('minOrderQuantity')) {
  editPageContent = editPageContent.replace(
    /atmosphereTheme:\s*'default',/g,
    "atmosphereTheme: 'default', minOrderQuantity: 1, maxOrderQuantity: '', stockQuantity: '',"
  );
}

// In load effect, load limits from product or storage
const oldLoadBlock = `      setForm({
        name: product.name || '', brand: product.brand || 'Brand 2 Brand',
        description: product.description || '', price: product.price?.toString() || '',
        originalPrice: product.original_price?.toString() || '', categoryId: catId,
        subcategoryId: product.subcategory_id || '', gender: product.gender || '',
        badge: product.badge || '', atmosphereTheme: product.atmosphere_theme || 'default',
      });`;

const newLoadBlock = `      let qMeta = {};
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
        : (pLimit.maxOrderQuantity || '');
      const stockQuantity = (product.stock_quantity !== undefined && product.stock_quantity !== null)
        ? product.stock_quantity
        : (pLimit.stockQuantity !== undefined ? pLimit.stockQuantity : '');

      setForm({
        name: product.name || '', brand: product.brand || 'Brand 2 Brand',
        description: product.description || '', price: product.price?.toString() || '',
        originalPrice: product.original_price?.toString() || '', categoryId: catId,
        subcategoryId: product.subcategory_id || '', gender: product.gender || '',
        badge: product.badge || '', atmosphereTheme: product.atmosphere_theme || 'default',
        minOrderQuantity, maxOrderQuantity, stockQuantity,
      });`;

if (editPageContent.includes(oldLoadBlock)) {
  editPageContent = editPageContent.replace(oldLoadBlock, newLoadBlock);
}

// In handleSubmit, include these in JSON.stringify
if (!editPageContent.includes('minOrderQuantity: form.minOrderQuantity')) {
  editPageContent = editPageContent.replace(
    /badge:\s*form\.badge,/g,
    `badge: form.badge,
          minOrderQuantity: form.minOrderQuantity || 1,
          maxOrderQuantity: form.maxOrderQuantity || null,
          stockQuantity: form.stockQuantity !== '' ? form.stockQuantity : null,`
  );
}

// Insert the UI section in edit page
if (!editPageContent.includes('Gadget Order Quantity &amp; Stock Limits')) {
  editPageContent = editPageContent.replace(
    '        {/* ── SECTION 3: Sizes ── */}',
    `${gadgetQuantityUISection}\n        {/* ── SECTION 3: Sizes ── */}`
  );
}

fs.writeFileSync(editPagePath, editPageContent, 'utf8');
console.log('✅ Updated products/[id]/edit/page.js');

// ─────────────────────────────────────────────────────────────
// 5. UPDATE products/page.js (Product list in Admin)
// ─────────────────────────────────────────────────────────────
const productsListPath = path.join(adminDir, 'src/app/products/page.js');
let productsListContent = fs.readFileSync(productsListPath, 'utf8');

// Add gadgetQuantities state to products/page.js if not present
if (!productsListContent.includes('gadgetQuantities')) {
  productsListContent = productsListContent.replace(
    'const [products, setProducts] = useState([]);',
    'const [products, setProducts] = useState([]);\n  const [gadgetQuantities, setGadgetQuantities] = useState({});'
  );

  productsListContent = productsListContent.replace(
    'setProducts(data || []);',
    `setProducts(data || []);
      supabase.storage.from('store-config').download('gadget_quantities.json')
        .then(async ({ data: qData }) => {
          if (qData) {
            try { setGadgetQuantities(JSON.parse(await qData.text())); } catch (e) {}
          }
        }).catch(() => {});`
  );
}

// Add Order Limits column header
if (!productsListContent.includes('<th>Order Limits</th>')) {
  productsListContent = productsListContent.replace(
    '<th>Price</th><th>Badge</th>',
    '<th>Price</th><th>Badge</th><th>Order Limits</th>'
  );

  // Add Order Limits cell
  const oldPriceBadgeCell = `                    <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString()}</td>
                    <td>{p.badge ? <span className="admin-badge">{p.badge}</span> : <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}</td>`;

  const newPriceBadgeCell = `                    <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString()}</td>
                    <td>{p.badge ? <span className="admin-badge">{p.badge}</span> : <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}</td>
                    <td>
                      {p.subcategories?.categories?.slug === 'gadgets' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1' }}>
                            Min: {p.min_order_quantity || gadgetQuantities[p.id]?.minOrderQuantity || 1}
                          </span>
                          {(p.max_order_quantity || gadgetQuantities[p.id]?.maxOrderQuantity || p.stock_quantity || gadgetQuantities[p.id]?.stockQuantity) && (
                            <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>
                              Max: {p.max_order_quantity || gadgetQuantities[p.id]?.maxOrderQuantity || '∞'} · Stock: {p.stock_quantity !== undefined && p.stock_quantity !== null ? p.stock_quantity : (gadgetQuantities[p.id]?.stockQuantity !== undefined ? gadgetQuantities[p.id]?.stockQuantity : '—')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>Standard (1)</span>
                      )}
                    </td>`;

  if (productsListContent.includes(oldPriceBadgeCell)) {
    productsListContent = productsListContent.replace(oldPriceBadgeCell, newPriceBadgeCell);
  }
}

fs.writeFileSync(productsListPath, productsListContent, 'utf8');
console.log('✅ Updated products/page.js');

console.log('\\n🎉 All admin files updated successfully with Gadget Quantity & Stock Limits feature!');
