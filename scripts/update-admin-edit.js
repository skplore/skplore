const fs = require('fs');
const path = require('path');

const editPagePath = path.resolve(__dirname, '../../skplore-admin/src/app/products/[id]/edit/page.js');

if (!fs.existsSync(editPagePath)) {
  console.error('File does not exist:', editPagePath);
  process.exit(1);
}

let code = fs.readFileSync(editPagePath, 'utf8');

// Update getSizePreset in edit page
const updatedPreset = `function getSizePreset(subcategoryName, world) {
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
}`;

code = code.replace(/function getSizePreset[\s\S]*?return \{ label: 'Sizes', sizes: \['XS'[\s\S]*?\};?\s*\}/, updatedPreset);

// Add world state if not present
if (!code.includes('const [world, setWorld]')) {
  code = code.replace(
    /const \[uploadProgress, setUploadProgress\] = useState\(''\);/,
    "const [uploadProgress, setUploadProgress] = useState('');\n  const [world, setWorld] = useState('fashion');"
  );

  // Set initial world inside load()
  code = code.replace(
    /const catId = product\.subcategories\?\.categories\?\.id \|\| '';/,
    `const catId = product.subcategories?.categories?.id || '';
      const isGadget = product.subcategories?.categories?.slug === 'gadgets' || product.atmosphere_theme === 'gadgets';
      setWorld(isGadget ? 'gadgets' : 'fashion');`
  );
}

// Update sizePreset calculation
code = code.replace(/const sizePreset = getSizePreset\(selectedSubName\);/, 'const sizePreset = getSizePreset(selectedSubName, world);');

fs.writeFileSync(editPagePath, code, 'utf8');
console.log('Successfully updated edit/page.js!');
