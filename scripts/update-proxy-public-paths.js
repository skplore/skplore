const fs = require('fs');

const file = 'd:/skplore-admin/src/proxy.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("'/api/gadget-limits'")) {
  content = content.replace(
    "const PUBLIC_PATHS = ['/login'];",
    "const PUBLIC_PATHS = ['/login', '/api/gadget-limits'];"
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated proxy.js with /api/gadget-limits public path');
} else {
  console.log('proxy.js already includes /api/gadget-limits');
}
