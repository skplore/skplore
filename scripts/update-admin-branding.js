const fs = require('fs');
const path = require('path');

const adminDir = path.resolve(__dirname, '../../skplore-admin');

// 1. Update AdminLayoutClient.js
const layoutClientPath = path.join(adminDir, 'src/app/AdminLayoutClient.js');
let layoutClient = fs.readFileSync(layoutClientPath, 'utf8');

// Replace brand
layoutClient = layoutClient.replace('<div className="admin-sidebar-brand-icon">B2B</div>', '<div className="admin-sidebar-brand-icon">SKP</div>');
layoutClient = layoutClient.replace('<span>Brand 2 Brand</span>', '<span>Skplore</span>');

// Add Discounts nav item if not present
if (!layoutClient.includes("href: '/discounts'")) {
  const productsNavBlock = `{
      href: '/products',
      label: 'Products',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },`;

  const discountsNavBlock = `{
      href: '/products',
      label: 'Products',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      href: '/discounts',
      label: 'Discounts',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },`;

  layoutClient = layoutClient.replace(productsNavBlock, discountsNavBlock);
}

// Update topbar title for discounts
if (!layoutClient.includes("pathname.startsWith('/discounts')")) {
  layoutClient = layoutClient.replace(
    "{pathname.startsWith('/products') && 'Products'}",
    "{pathname.startsWith('/products') && 'Products'}\n            {pathname.startsWith('/discounts') && 'Discounts'}"
  );
}

fs.writeFileSync(layoutClientPath, layoutClient, 'utf8');

// 2. Update layout.js
const layoutPath = path.join(adminDir, 'src/app/layout.js');
let layout = fs.readFileSync(layoutPath, 'utf8');
layout = layout.replace('Admin Dashboard | Brand 2 Brand', 'Admin Dashboard | Skplore');
fs.writeFileSync(layoutPath, layout, 'utf8');

// 3. Update login/page.js
const loginPath = path.join(adminDir, 'src/app/login/page.js');
let login = fs.readFileSync(loginPath, 'utf8');
login = login.replace('>B2B<', '>SKP<');
login = login.replace('<h1>Admin Login</h1>', '<h1>Skplore Admin</h1>');
login = login.replace('admin@brand2brand.com', 'admin@skplore.com');
fs.writeFileSync(loginPath, login, 'utf8');

// 4. Update admin.css header
const cssPath = path.join(adminDir, 'src/app/admin.css');
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace('Brand 2 Brand — Admin Dashboard CSS', 'Skplore — Admin Dashboard CSS');
fs.writeFileSync(cssPath, css, 'utf8');

// 5. Update api/upload-product and edit-product defaults
const uploadProdPath = path.join(adminDir, 'src/app/api/upload-product/route.js');
if (fs.existsSync(uploadProdPath)) {
  let up = fs.readFileSync(uploadProdPath, 'utf8');
  up = up.replace(/brand\s*\|\|\s*'Brand 2 Brand'/g, "brand || 'Skplore'");
  up = up.replace(/DEFAULT\s*'Brand 2 Brand'/g, "DEFAULT 'Skplore'");
  fs.writeFileSync(uploadProdPath, up, 'utf8');
}

const editProdPath = path.join(adminDir, 'src/app/api/edit-product/route.js');
if (fs.existsSync(editProdPath)) {
  let ep = fs.readFileSync(editProdPath, 'utf8');
  ep = ep.replace(/brand\s*\|\|\s*'Brand 2 Brand'/g, "brand || 'Skplore'");
  fs.writeFileSync(editProdPath, ep, 'utf8');
}

console.log('Successfully updated Admin branding to Skplore & added Discounts to nav!');
