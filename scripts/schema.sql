-- ============================================
-- Skplore — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Categories
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Subcategories
-- ============================================
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- ============================================
-- Products
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'Skplore',
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
  gender TEXT CHECK (gender IN ('men', 'women') OR gender IS NULL),
  price INTEGER NOT NULL,
  original_price INTEGER,
  description TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  badge TEXT CHECK (badge IN ('BESTSELLER', 'NEW', 'TRENDING', 'EXCLUSIVE') OR badge IS NULL),
  atmosphere_theme TEXT DEFAULT 'default',
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER DEFAULT NULL,
  stock_quantity INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Product Images
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_badge ON products(badge);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, display_order);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can read)
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read product images" ON product_images FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "Auth users can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can insert subcategories" ON subcategories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update subcategories" ON subcategories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete subcategories" ON subcategories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can insert product images" ON product_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update product images" ON product_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete product images" ON product_images FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
