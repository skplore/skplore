const fs = require('fs');
const path = require('path');

const targetDir = 'd:/skplore-admin/src/app/api/gadget-limits';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetFile = path.join(targetDir, 'route.js');

const code = `import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const supabase = createAdminClient();

    // 1. Fetch from store-config/gadget_quantities.json
    let quantitiesMap = {};
    try {
      const { data, error } = await supabase.storage
        .from('store-config')
        .download('gadget_quantities.json');
      if (data && !error) {
        const text = await data.text();
        quantitiesMap = JSON.parse(text);
      }
    } catch (e) {
      console.warn('Error reading gadget_quantities.json in API:', e.message);
    }

    // 2. If a specific productId was requested
    if (productId) {
      const fromStorage = quantitiesMap[productId] || {};
      let limits = {
        minOrderQuantity: fromStorage.minOrderQuantity !== undefined ? fromStorage.minOrderQuantity : 1,
        maxOrderQuantity: fromStorage.maxOrderQuantity !== undefined ? fromStorage.maxOrderQuantity : null,
        stockQuantity: fromStorage.stockQuantity !== undefined ? fromStorage.stockQuantity : null,
      };

      // Also attempt to check if native Postgres columns exist
      try {
        const { data: prod } = await supabase
          .from('products')
          .select('min_order_quantity, max_order_quantity, stock_quantity')
          .eq('id', productId)
          .single();

        if (prod) {
          if (prod.min_order_quantity !== null && prod.min_order_quantity !== undefined) {
            limits.minOrderQuantity = prod.min_order_quantity;
          }
          if (prod.max_order_quantity !== null && prod.max_order_quantity !== undefined) {
            limits.maxOrderQuantity = prod.max_order_quantity;
          }
          if (prod.stock_quantity !== null && prod.stock_quantity !== undefined) {
            limits.stockQuantity = prod.stock_quantity;
          }
        }
      } catch (err) {
        // Native columns might not exist yet, that's fine
      }

      return NextResponse.json(
        { productId, ...limits },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    // Return the full map
    return NextResponse.json(
      { quantities: quantitiesMap },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err) {
    console.error('API /api/gadget-limits error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully wrote to', targetFile);
