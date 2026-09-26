const fs = require('fs');
const path = require('path');

const adminDir = path.resolve(__dirname, '../../skplore-admin');

// 1. Create /api/subcategories/route.js
const subcategoriesRoute = `import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request) {
  try {
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const supabase = createAdminClient();
    const body = await request.json();
    const { category_id, name, slug, gender = 'both' } = body;

    if (!category_id || !name) {
      return NextResponse.json(
        { error: 'category_id and name are required.' },
        { status: 400 }
      );
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Attempt insert with gender first
    let { data, error } = await supabase
      .from('subcategories')
      .insert({
        category_id,
        name,
        slug: finalSlug,
        gender,
      })
      .select();

    // If gender column is not yet added to Postgres schema, fallback to inserting without it
    if (error && error.message && error.message.includes('gender')) {
      const fallback = await supabase
        .from('subcategories')
        .insert({
          category_id,
          name,
          slug: finalSlug,
        })
        .select();

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, subcategory: data?.[0] }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/subcategories:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('subcategories').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/subcategories:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
`;

// 2. Create /api/categories/route.js
const categoriesRoute = `import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request) {
  try {
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const supabase = createAdminClient();
    const body = await request.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug: finalSlug,
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, category: data?.[0] }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/categories:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/categories:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
`;

fs.mkdirSync(path.join(adminDir, 'src/app/api/subcategories'), { recursive: true });
fs.writeFileSync(path.join(adminDir, 'src/app/api/subcategories/route.js'), subcategoriesRoute, 'utf8');

fs.mkdirSync(path.join(adminDir, 'src/app/api/categories'), { recursive: true });
fs.writeFileSync(path.join(adminDir, 'src/app/api/categories/route.js'), categoriesRoute, 'utf8');

console.log('Successfully created API routes in skplore-admin!');
