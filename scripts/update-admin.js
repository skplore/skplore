const fs = require('fs');
const path = require('path');

const adminDir = path.resolve(__dirname, '../../skplore-admin');
console.log('Target admin dir:', adminDir);

if (!fs.existsSync(adminDir)) {
  console.error('Admin directory does not exist at:', adminDir);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// 1. UPDATE new/page.js
// ─────────────────────────────────────────────────────────────
const newPageCode = `'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { compressImage, formatBytes } from '@/lib/compressImage';
import { uploadToR2Direct } from '@/lib/r2Direct';

// ── Smart Size presets by subcategory keyword ──
function getSizePreset(subcategoryName, world) {
  if (world === 'gadgets') {
    const n = (subcategoryName || '').toLowerCase();
    if (/case|cover|screen|guard|phone/.test(n)) {
      return { 
        label: 'Phone Models & Compatibility', 
        sizes: ['Universal', 'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'Samsung S24 Ultra', 'Samsung S24+'] 
      };
    }
    return { 
      label: 'Tech Gear Specs', 
      sizes: ['Standard', 'One Size', 'Universal', '2 Meters', '1 Meter'] 
    };
  }

  const n = (subcategoryName || '').toLowerCase();
  if (/shirt|top|t-shirt|tee|kurta|blouse|polo|sweatshirt|hoodie|jacket|coat|blazer|dress|co-ord/.test(n))
    return { label: 'Clothing Sizes', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] };
  if (/pant|trouser|jean|chino|short|skirt|legging/.test(n))
    return { label: 'Bottom Sizes (waist)', sizes: ['26', '28', '30', '32', '34', '36', '38', '40', '42'] };
  if (/shoe|sneaker|boot|sandal|slipper|footwear|loafer|heel|flat/.test(n))
    return { label: 'Footwear Sizes (UK)', sizes: ['4', '5', '6', '7', '8', '9', '10', '11', '12'] };
  if (/bag|wallet|belt|watch|jewel|accessory|accessories|cap|hat|sock/.test(n))
    return { label: 'Accessories Sizes', sizes: ['Free Size', 'One Size'] };
  return { label: 'Sizes', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] };
}

const COMMON_COLORS = [
  { name: 'Black',     hex: '#111111' },
  { name: 'White',     hex: '#f5f5f5' },
  { name: 'Navy',      hex: '#1e3a5f' },
  { name: 'Red',       hex: '#dc2626' },
  { name: 'Maroon',    hex: '#7f1d1d' },
  { name: 'Olive',     hex: '#5f6b1e' },
  { name: 'Green',     hex: '#16a34a' },
  { name: 'Blue',      hex: '#2563eb' },
  { name: 'Sky Blue',  hex: '#0ea5e9' },
  { name: 'Grey',      hex: '#6b7280' },
  { name: 'Brown',     hex: '#92400e' },
  { name: 'Beige',     hex: '#d4a574' },
  { name: 'Pink',      hex: '#ec4899' },
  { name: 'Purple',    hex: '#7c3aed' },
  { name: 'Yellow',    hex: '#eab308' },
  { name: 'Orange',    hex: '#ea580c' },
];

export default function AdminNewProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const coverInputRef = useRef(null);
  const variantInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [selectedSubName, setSelectedSubName] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  // Brand World: 'fashion' | 'gadgets'
  const [world, setWorld] = useState('fashion');

  const [form, setForm] = useState({
    name: '', brand: 'Skplore', description: '', price: '',
    originalPrice: '', categoryId: '', subcategoryId: '',
    gender: 'men', badge: '', atmosphereTheme: 'clothing',
  });

  const [sizes, setSizes] = useState([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colors, setColors] = useState([]);
  const [customColorInput, setCustomColorInput] = useState('');

  const [coverImage, setCoverImage] = useState(null);
  const [variantImages, setVariantImages] = useState([]);

  useEffect(() => {
    supabase.from('categories').select('*, subcategories(*)').order('name')
      .then(({ data }) => {
        const cats = data || [];
        setCategories(cats);
        // Initial setup for default world 'fashion'
        const fashionCats = cats.filter(c => c.slug !== 'gadgets');
        if (fashionCats.length > 0) {
          setForm(prev => ({
            ...prev,
            categoryId: fashionCats[0].id,
            subcategoryId: '',
            atmosphereTheme: 'clothing',
          }));
          setSubcategories(fashionCats[0].subcategories || []);
        }
      });
  }, []);

  const handleWorldChange = (selectedWorld) => {
    setWorld(selectedWorld);
    setSizes([]);
    setSelectedSubName('');

    if (selectedWorld === 'gadgets') {
      const gadgetCat = categories.find(c => c.slug === 'gadgets' || c.name.toLowerCase() === 'gadgets');
      if (gadgetCat) {
        setForm(prev => ({
          ...prev,
          categoryId: gadgetCat.id,
          subcategoryId: '',
          gender: 'unisex',
          atmosphereTheme: 'gadgets',
        }));
        setSubcategories(gadgetCat.subcategories || []);
      }
    } else {
      // Fashion
      const fashionCats = categories.filter(c => c.slug !== 'gadgets');
      if (fashionCats.length > 0) {
        setForm(prev => ({
          ...prev,
          categoryId: fashionCats[0].id,
          subcategoryId: '',
          gender: prev.gender === 'unisex' ? 'men' : (prev.gender || 'men'),
          atmosphereTheme: 'clothing',
        }));
        setSubcategories(fashionCats[0].subcategories || []);
      }
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find(c => c.id === catId);
    setForm(prev => ({
      ...prev,
      categoryId: catId,
      subcategoryId: '',
      atmosphereTheme: cat?.slug === 'footwear' ? 'footwear' : cat?.slug === 'accessories' ? 'accessories' : 'clothing',
    }));
    setSubcategories(cat?.subcategories || []);
    setSelectedSubName('');
    setSizes([]);
  };

  const handleSubcategoryChange = (e) => {
    const id = e.target.value;
    const sub = subcategories.find(s => s.id === id);
    setForm(prev => ({ ...prev, subcategoryId: id }));
    setSelectedSubName(sub?.name || '');
    setSizes([]);
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const sizePreset = getSizePreset(selectedSubName, world);

  const toggleSize = (s) => setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleColor = (c) => setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const addCustomSize = () => {
    const v = customSizeInput.trim();
    if (v && !sizes.includes(v)) { setSizes(prev => [...prev, v]); setCustomSizeInput(''); }
  };
  const addCustomColor = () => {
    const v = customColorInput.trim();
    if (v && !colors.includes(v)) { setColors(prev => [...prev, v]); setCustomColorInput(''); }
  };

  const handleCoverSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCompressing(true);
    try {
      const result = await compressImage(file);
      setCoverImage({
        file:           result.file,
        preview:        URL.createObjectURL(result.file),
        originalSize:   result.originalSize,
        compressedSize: result.compressedSize,
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleVariantsSelected = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;
    setCompressing(true);
    try {
      const results = await Promise.all(files.map(f => compressImage(f)));
      setVariantImages(prev => [
        ...prev,
        ...results.map(r => ({
          file:           r.file,
          preview:        URL.createObjectURL(r.file),
          colorTag:       '',
          originalSize:   r.originalSize,
          compressedSize: r.compressedSize,
        })),
      ]);
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.subcategoryId) {
      alert('Please fill: name, price, and subcategory.');
      return;
    }
    setLoading(true);
    setUploadProgress('');
    try {
      const productRes = await fetch('/api/upload-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          subcategoryId: form.subcategoryId,
          gender: world === 'gadgets' ? 'unisex' : form.gender,
          price: form.price,
          originalPrice: form.originalPrice,
          description: form.description,
          sizes,
          colors,
          badge: form.badge,
          atmosphereTheme: form.atmosphereTheme,
        }),
      });

      const productJson = await productRes.json();
      if (!productRes.ok) throw new Error(productJson.error || 'Failed to create product');

      const productId = productJson.productId;
      const folder = \`skplore/products/\${productId}\`;
      const imageResults = { uploaded: 0, failed: 0, errors: [] };

      const totalImages = (coverImage ? 1 : 0) + variantImages.length;
      let completedImages = 0;

      // Upload cover image
      if (coverImage?.file) {
        try {
          setUploadProgress(\`Uploading cover image (1/\${totalImages})...\`);
          const ext = coverImage.file.name.split('.').pop();
          const result = await uploadToR2Direct(coverImage.file, folder, \`cover.\${ext}\`);

          await fetch('/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              imageUrl: result.url,
              displayOrder: 0,
              colorTag: null,
            }),
          });

          imageResults.uploaded++;
          completedImages++;
        } catch (err) {
          imageResults.failed++;
          imageResults.errors.push(\`Cover upload: \${err.message}\`);
          completedImages++;
        }
      }

      // Upload variant images
      const variantColorTags = variantImages.map(v => v.colorTag);
      for (let i = 0; i < variantImages.length; i++) {
        const img = variantImages[i];
        if (!img.file) continue;
        try {
          setUploadProgress(\`Uploading image \${completedImages + 1}/\${totalImages}...\`);
          const ext = img.file.name.split('.').pop();
          const result = await uploadToR2Direct(img.file, folder, \`variant_\${i + 1}.\${ext}\`);

          await fetch('/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              imageUrl: result.url,
              displayOrder: i + 1,
              colorTag: variantColorTags[i] || null,
            }),
          });

          imageResults.uploaded++;
          completedImages++;
        } catch (err) {
          imageResults.failed++;
          imageResults.errors.push(\`Variant \${i + 1}: \${err.message}\`);
          completedImages++;
        }
      }

      if (imageResults.failed > 0) {
        alert(\`Product created, but \${imageResults.failed} image(s) failed to upload:\\n\\n\${imageResults.errors.join('\\n')}\\n\\nYou can re-upload images from the Edit page.\`);
      }

      router.push('/products');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const visibleCategories = world === 'gadgets'
    ? categories.filter(c => c.slug === 'gadgets')
    : categories.filter(c => c.slug !== 'gadgets');

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Add New Product</h2>
          <p className="admin-page-subtitle">Curate for Fashion (Men &amp; Women) or Gadgets &amp; Tech</p>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={() => router.back()}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="admin-new-product-form">

        {/* ── STEP 1: Select Brand World ── */}
        <div className="admin-form-section">
          <div className="admin-form-section-title">
            <span className="admin-form-section-num">1</span> Brand World
          </div>
          <div className="admin-form-section-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div
                onClick={() => handleWorldChange('fashion')}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: world === 'fashion' ? '2px solid #C41230' : '1px solid rgba(255,255,255,0.12)',
                  background: world === 'fashion' ? 'rgba(196,18,48,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  👗 FASHION
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  Men &amp; Women · Clothing, Footwear &amp; Accessories
                </div>
              </div>

              <div
                onClick={() => handleWorldChange('gadgets')}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: world === 'gadgets' ? '2px solid #0D9488' : '1px solid rgba(255,255,255,0.12)',
                  background: world === 'gadgets' ? 'rgba(13,148,136,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  📱 GADGETS
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  Phone Cases, Screen Guards, Audio &amp; Unique Tech
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 2: Product Info ── */}
        <div className="admin-form-section">
          <div className="admin-form-section-title">
            <span className="admin-form-section-num">2</span> Product Info
          </div>
          <div className="admin-form-section-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Product Name *</label>
              <input className="admin-form-input admin-form-input-lg" value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder={world === 'gadgets' ? "e.g. Aether Pro Carbon Fiber Phone Case" : "e.g. Midnight Floral Print Shirt"} required id="product-name" />
            </div>
            <div className="admin-form-row-3">
              <div className="admin-form-group">
                <label className="admin-form-label">Brand</label>
                <input className="admin-form-input" value={form.brand}
                  onChange={e => handleChange('brand', e.target.value)} />
              </div>

              {world === 'fashion' ? (
                <div className="admin-form-group">
                  <label className="admin-form-label">Target Audience / Gender *</label>
                  <select className="admin-form-select" value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)} required>
                    <option value="men">Men's Collection</option>
                    <option value="women">Women's Collection</option>
                    <option value="unisex">Unisex / All</option>
                  </select>
                </div>
              ) : (
                <div className="admin-form-group">
                  <label className="admin-form-label">Type</label>
                  <input className="admin-form-input" value="Tech / Gadgets" disabled />
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-form-label">Badge</label>
                <select className="admin-form-select" value={form.badge}
                  onChange={e => handleChange('badge', e.target.value)}>
                  <option value="">None</option>
                  <option value="BESTSELLER">Bestseller</option>
                  <option value="NEW">New</option>
                  <option value="TRENDING">Trending</option>
                  <option value="EXCLUSIVE">Exclusive</option>
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Selling Price (₹) *</label>
                <input type="number" className="admin-form-input" value={form.price}
                  onChange={e => handleChange('price', e.target.value)} placeholder="1999" required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Original Price (₹) <span className="admin-form-label-hint">for strikethrough</span></label>
                <input type="number" className="admin-form-input" value={form.originalPrice}
                  onChange={e => handleChange('originalPrice', e.target.value)} placeholder="2999" />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Description <span className="admin-form-label-hint">optional</span></label>
              <textarea className="admin-form-textarea" value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Describe product highlights, materials, compatibility..." />
            </div>
          </div>
        </div>

        {/* ── STEP 3: Category & Department ── */}
        <div className="admin-form-section">
          <div className="admin-form-section-title">
            <span className="admin-form-section-num">3</span> Category &amp; Subcategory
          </div>
          <div className="admin-form-section-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Category *</label>
                <select className="admin-form-select" value={form.categoryId}
                  onChange={handleCategoryChange} required>
                  <option value="">Select category...</option>
                  {visibleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Subcategory *</label>
                <select className="admin-form-select" value={form.subcategoryId}
                  onChange={handleSubcategoryChange} required disabled={!form.categoryId}>
                  <option value="">Select subcategory...</option>
                  {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Atmosphere Theme</label>
              <div className="admin-chip-row">
                {['default', 'clothing', 'footwear', 'accessories', 'gadgets'].map(t => (
                  <button key={t} type="button"
                    className={\`admin-chip \${form.atmosphereTheme === t ? 'selected' : ''}\`}
                    onClick={() => handleChange('atmosphereTheme', t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 4: Sizes / Device Models ── */}
        <div className="admin-form-section">
          <div className="admin-form-section-title">
            <span className="admin-form-section-num">4</span> {world === 'gadgets' ? 'Compatibility / Models' : 'Sizes'}
            {selectedSubName && <span className="admin-form-section-hint"> — {sizePreset.label}</span>}
          </div>
          <div className="admin-form-section-body">
            {!form.subcategoryId && (
              <p className="admin-hint-text">💡 Select a subcategory first to see smart options</p>
            )}
            {form.subcategoryId && (
              <div className="admin-chip-grid">
                {sizePreset.sizes.map(s => (
                  <button key={s} type="button"
                    className={\`admin-size-chip \${sizes.includes(s) ? 'selected' : ''}\`}
                    onClick={() => toggleSize(s)}>
                    {s}
                    {sizes.includes(s) && <span className="admin-chip-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="admin-custom-add-row">
              <input className="admin-form-input" value={customSizeInput}
                onChange={e => setCustomSizeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }}
                placeholder={world === 'gadgets' ? "Add custom model (e.g. OnePlus 12)..." : "Custom size (e.g. 44, XXXL)..."} />
              <button type="button" className="admin-btn admin-btn-outline" onClick={addCustomSize}>+ Add</button>
            </div>
            {sizes.length > 0 && (
              <div className="admin-selected-chips">
                <span className="admin-selected-label">Selected:</span>
                {sizes.map(s => (
                  <span key={s} className="admin-tag">
                    {s}<button type="button" onClick={() => setSizes(prev => prev.filter(x => x !== s))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── STEP 5: Colours ── */}
        <div className="admin-form-section">
          <div className="admin-form-section-title">
            <span className="admin-form-section-num">5</span> Colours / Finishes
          </div>
          <div className="admin-form-section-body">
            <div className="admin-color-swatches">
              {COMMON_COLORS.map(c => (
                <button key={c.name} type="button"
                  className={\`admin-color-swatch \${colors.includes(c.name) ? 'selected' : ''}\`}
                  style={{ '--swatch-color': c.hex }}
                  onClick={() => toggleColor(c.name)}
                  title={c.name}>
                  {colors.includes(c.name) && <span className="admin-swatch-check">✓</span>}
                  <span className="admin-swatch-label">{c.name}</span>
                </button>
              ))}
            </div>
            <div className="admin-custom-add-row">
              <input className="admin-form-input" value={customColorInput}
                onChange={e => setCustomColorInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); } }}
                placeholder="Custom colour (e.g. Carbon Black, Silver)..." />
              <button type="button" className="admin-btn admin-btn-outline" onClick={addCustomColor}>+ Add</button>
            </div>
            {colors.length > 0 && (
              <div className="admin-selected-chips">
                <span className="admin-selected-label">Selected:</span>
                {colors.map(c => (
                  <span key={c} className="admin-tag">
                    {c}<button type="button" onClick={() => setColors(prev => prev.filter(x => x !== c))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── STEP 6: Images ── */}
        <div className="admin-form-section">
          <div className="admin-form-section-title">
            <span className="admin-form-section-num">6</span> Images
          </div>
          <div className="admin-form-section-body">
            <div className="admin-images-grid">
              {/* Cover Image */}
              <div className="admin-image-slot-group">
                <div className="admin-image-slot-label">📸 Cover Image <span className="admin-form-label-hint">main display photo</span></div>
                {compressing && !coverImage ? (
                  <div className="admin-image-compressing">
                    <span className="admin-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                    <p>Optimising image…</p>
                  </div>
                ) : coverImage ? (
                  <div className="admin-image-preview-single">
                    <img src={coverImage.preview} alt="Cover" />
                    <button className="admin-image-remove-btn" onClick={() => setCoverImage(null)} type="button">×</button>
                    <div className="admin-image-badge">Cover</div>
                    {coverImage.originalSize && (
                      <div className="admin-compress-badge">
                        {formatBytes(coverImage.originalSize)} → {formatBytes(coverImage.compressedSize)} ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="admin-image-drop-zone" onClick={() => coverInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>Click to upload cover</p>
                    <small>Auto-optimised for fast loading</small>
                  </div>
                )}
                <input type="file" ref={coverInputRef} onChange={handleCoverSelected} accept="image/*" style={{ display: 'none' }} />
              </div>

              {/* Variant Images */}
              <div className="admin-image-slot-group" style={{ flex: 2 }}>
                <div className="admin-image-slot-label">🎨 Variant / Detail Images <span className="admin-form-label-hint">gallery and angles</span></div>
                <div className="admin-variant-images-area">
                  <div className="admin-image-drop-zone admin-image-drop-zone-sm" onClick={() => variantInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <p>{compressing ? 'Optimising…' : 'Add variant images'}</p>
                  </div>
                  <input type="file" ref={variantInputRef} onChange={handleVariantsSelected} accept="image/*" multiple style={{ display: 'none' }} />
                  {variantImages.map((img, i) => (
                    <div key={i} className="admin-image-preview-single">
                      <img src={img.preview} alt={\`Variant \${i + 1}\`} />
                      <button className="admin-image-remove-btn" onClick={() => setVariantImages(prev => prev.filter((_, idx) => idx !== i))} type="button">×</button>
                      <div className="admin-image-badge">{i + 1}</div>
                      {img.originalSize && (
                        <div className="admin-compress-badge">
                          {formatBytes(img.originalSize)} → {formatBytes(img.compressedSize)} ✓
                        </div>
                      )}
                      {colors.length > 0 && (
                        <select className="admin-image-color-tag"
                          value={img.colorTag}
                          onChange={e => setVariantImages(prev => prev.map((v, idx) => idx === i ? { ...v, colorTag: e.target.value } : v))}>
                          <option value="">Tag colour</option>
                          {colors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <button type="submit" className="admin-btn admin-btn-primary admin-btn-submit"
          disabled={loading || compressing} id="save-product-btn">
          {loading ? (
            <><span className="admin-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {uploadProgress || 'Creating Product...'}</>
          ) : compressing ? (
            <><span className="admin-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Optimising Images...</>
          ) : (
            <>✓ Create Product</>
          )}
        </button>

      </form>
    </>
  );
}
`;

fs.writeFileSync(path.join(adminDir, 'src/app/products/new/page.js'), newPageCode, 'utf8');
console.log('Updated products/new/page.js!');

// ─────────────────────────────────────────────────────────────
// 2. UPDATE products/page.js (Product list with World Filters)
// ─────────────────────────────────────────────────────────────
const productsListPath = path.join(adminDir, 'src/app/products/page.js');
let productsListCode = fs.readFileSync(productsListPath, 'utf8');

// Add world filter state if not present
if (!productsListCode.includes('worldFilter')) {
  productsListCode = productsListCode.replace(
    /const \[search, setSearch\] = useState\(''\);/,
    "const [search, setSearch] = useState('');\n  const [worldFilter, setWorldFilter] = useState('all'); // 'all', 'fashion-men', 'fashion-women', 'gadgets'"
  );

  // Update filter logic
  productsListCode = productsListCode.replace(
    /const filtered = categoryFiltered\.filter\(p =>[\s\S]*?\);/,
    `const filtered = categoryFiltered.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategories?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategories?.categories?.name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (worldFilter === 'gadgets') {
      return p.subcategories?.categories?.slug === 'gadgets' || p.atmosphere_theme === 'gadgets';
    }
    if (worldFilter === 'fashion-men') {
      return p.subcategories?.categories?.slug !== 'gadgets' && (p.gender === 'men' || p.gender === 'unisex');
    }
    if (worldFilter === 'fashion-women') {
      return p.subcategories?.categories?.slug !== 'gadgets' && (p.gender === 'women' || p.gender === 'unisex');
    }
    return true;
  });`
  );

  // Add world filter UI pills right before products table or search bar
  const filterPills = `
      {/* World Quick Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={\`admin-chip \${worldFilter === 'all' ? 'selected' : ''}\`}
          onClick={() => setWorldFilter('all')}
        >
          All Items ({products.length})
        </button>
        <button
          type="button"
          className={\`admin-chip \${worldFilter === 'fashion-men' ? 'selected' : ''}\`}
          onClick={() => setWorldFilter('fashion-men')}
        >
          👗 Fashion · Men
        </button>
        <button
          type="button"
          className={\`admin-chip \${worldFilter === 'fashion-women' ? 'selected' : ''}\`}
          onClick={() => setWorldFilter('fashion-women')}
        >
          👗 Fashion · Women
        </button>
        <button
          type="button"
          className={\`admin-chip \${worldFilter === 'gadgets' ? 'selected' : ''}\`}
          onClick={() => setWorldFilter('gadgets')}
        >
          📱 Gadgets &amp; Tech
        </button>
      </div>
  `;

  productsListCode = productsListCode.replace(
    /<div className="admin-page-header">[\s\S]*?<\/div>\s*<\/div>/,
    (match) => match + '\n' + filterPills
  );

  fs.writeFileSync(productsListPath, productsListCode, 'utf8');
  console.log('Updated products/page.js with world filters!');
}

// ─────────────────────────────────────────────────────────────
// 3. UPDATE AdminLayoutClient.js
// ─────────────────────────────────────────────────────────────
const layoutPath = path.join(adminDir, 'src/app/AdminLayoutClient.js');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');
layoutCode = layoutCode.replace(/Brand 2 Brand/g, 'Skplore');
layoutCode = layoutCode.replace(/Brand2Brand/g, 'Skplore');
layoutCode = layoutCode.replace(/<span>Skplore<\/span>\s*<small>Admin Panel<\/small>/, '<span>SKPLORE</span><small>Fashion &amp; Gadgets Admin</small>');

fs.writeFileSync(layoutPath, layoutCode, 'utf8');
console.log('Updated AdminLayoutClient.js branding!');

console.log('All admin optimizations complete!');
