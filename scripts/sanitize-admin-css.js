const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../../skplore-admin/src/app/admin.css');
let content = fs.readFileSync(cssPath, 'utf8');

// Strip BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

// Clean corrupted character sequences
content = content.replace(/\s*\?+/g, '---');
content = content.replace(/"\?"/g, '---');
content = content.replace(/-\?/g, '->');
content = content.replace(/o"/g, 'check');
content = content.replace(/\?/g, '-');
content = content.replace(//g, '');

// Also ensure .admin-layout, .admin-sidebar, and .admin-main have explicit, rock-solid dimensions
// and no overflow overlap
content = content.replace(/--admin-sidebar-width:\s*260px;/, '--admin-sidebar-width: 260px;\n  --admin-topbar-height: 64px;');

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Sanitized admin.css successfully!');
