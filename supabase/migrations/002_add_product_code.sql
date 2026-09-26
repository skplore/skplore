-- Migration: Add product_code column for unique product identification
-- Run this migration in Supabase SQL Editor

-- 1. Add product_code column (nullable TEXT with unique constraint)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE;

-- 2. Backfill existing products with auto-generated codes
-- Format: SKP-XXXX where XXXX is a zero-padded sequence number
DO $$
DECLARE
  r RECORD;
  seq_num INT := 1;
BEGIN
  -- Order by created_at ascending so oldest products get lowest numbers
  FOR r IN
    SELECT id FROM products
    WHERE product_code IS NULL
    ORDER BY created_at ASC NULLS LAST, id ASC
  LOOP
    -- Keep trying until we find a free code (handles collisions)
    LOOP
      BEGIN
        UPDATE products
          SET product_code = 'SKP-' || LPAD(seq_num::TEXT, 4, '0')
          WHERE id = r.id AND product_code IS NULL;
        seq_num := seq_num + 1;
        EXIT; -- success, move to next product
      EXCEPTION WHEN unique_violation THEN
        seq_num := seq_num + 1; -- try next number
      END;
    END LOOP;
  END LOOP;
END $$;

-- 3. Create a function to auto-generate product_code for new inserts
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  seq_num  INT;
BEGIN
  -- Only generate if product_code is not already provided
  IF NEW.product_code IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Find the highest existing sequence number
  SELECT COALESCE(MAX(CAST(SUBSTR(product_code, 5) AS INT)), 0) + 1
    INTO seq_num
    FROM products
    WHERE product_code ~ '^SKP-[0-9]+$';

  -- Generate and assign the code
  new_code := 'SKP-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.product_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-generate product_code on INSERT
DROP TRIGGER IF EXISTS trg_generate_product_code ON products;
CREATE TRIGGER trg_generate_product_code
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_code();
