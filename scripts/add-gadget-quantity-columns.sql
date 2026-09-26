-- ============================================================
-- Skplore — Database Migration: Gadget Quantity & Stock Limits
-- ============================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- to add native columns for dynamic order quantities & inventory tracking.

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN products.min_order_quantity IS 'Minimum quantity required per order (especially for gadgets, default 1)';
COMMENT ON COLUMN products.max_order_quantity IS 'Maximum allowable quantity per single order (upper limit)';
COMMENT ON COLUMN products.stock_quantity IS 'Total available stock quantity in inventory';

-- Index for stock availability filtering (optional)
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
