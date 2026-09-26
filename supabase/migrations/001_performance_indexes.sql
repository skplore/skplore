-- ============================================================
-- Skplore — Performance Indexes
-- ============================================================
-- ⚠️  RUN THIS MANUALLY in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--     This file cannot be executed by the app — it is a reference migration.
-- ============================================================

-- Index for category lookups (listing pages)
CREATE INDEX IF NOT EXISTS idx_products_subcategory_active
  ON products(subcategory_id) WHERE is_active = true;

-- Index for badge filtering (featured / trending / new)
CREATE INDEX IF NOT EXISTS idx_products_badge
  ON products(badge) WHERE is_active = true;

-- Index for gender filtering (footwear pages)
CREATE INDEX IF NOT EXISTS idx_products_gender
  ON products(gender) WHERE is_active = true;

-- Composite index for product images ordering
CREATE INDEX IF NOT EXISTS idx_product_images_product_order
  ON product_images(product_id, display_order);

-- Slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- Colour-tag index (for colour variant system)
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_tag TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_product_images_color_tag
  ON product_images(color_tag) WHERE color_tag IS NOT NULL;

-- Verify indexes were created:
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE tablename IN ('products','product_images','categories','subcategories');
