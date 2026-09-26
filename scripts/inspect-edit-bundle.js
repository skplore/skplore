const fs = require('fs');

async function check() {
  try {
    const res = await fetch('http://localhost:3001/api/gadget-limits?productId=d53e77b4-8add-4379-8e87-0407cd922c7d');
    console.log('gadget-limits status:', res.status);
    const json = await res.json();
    console.log('gadget-limits JSON:', json);
  } catch (e) {
    console.error('gadget-limits error:', e.message);
  }
}

check();
