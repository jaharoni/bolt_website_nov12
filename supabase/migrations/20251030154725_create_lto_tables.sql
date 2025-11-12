/*
  # Create LTO (Limited Time Offer) Tables

  1. New Tables
    - `lto_offers`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title` (text) - Campaign title
      - `description` (text) - Campaign description
      - `media_id` (uuid) - Featured image
      - `status` (text) - draft, active, paused, ended
      - `start_date` (timestamptz) - When campaign starts
      - `end_date` (timestamptz) - When campaign ends
      - `end_condition_type` (text[]) - Array of end conditions
      - `target_quantity` (integer) - Total quantity limit
      - `target_revenue` (numeric) - Revenue goal in cents
      - `max_quantity_per_order` (integer) - Order limit per customer
      - `metadata` (jsonb) - Additional data
      - `views_count` (integer) - Total views
      - `orders_count` (integer) - Total orders
      - `revenue_total` (numeric) - Total revenue
      - `is_featured` (boolean) - Featured campaign
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lto_variants`
      - `id` (uuid, primary key)
      - `offer_id` (uuid, foreign key) - Parent campaign
      - `variant_label` (text) - Variant name (e.g., "12x18 Poster")
      - `variant_description` (text) - Variant details
      - `printful_product_id` (text) - Printful product ID
      - `printful_variant_id` (text) - Printful variant ID
      - `price_cents` (integer) - Price in cents
      - `cost_cents` (integer) - Cost in cents
      - `sort_order` (integer) - Display order
      - `is_available` (boolean) - Available for purchase
      - `stock_limit` (integer) - Max stock (null = unlimited)
      - `sold_count` (integer) - Total sold
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create lto_offers table
CREATE TABLE IF NOT EXISTS lto_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  media_id uuid REFERENCES media_items(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  start_date timestamptz,
  end_date timestamptz,
  end_condition_type text[] DEFAULT '{}',
  target_quantity integer,
  target_revenue numeric,
  max_quantity_per_order integer DEFAULT 10,
  metadata jsonb DEFAULT '{}',
  views_count integer DEFAULT 0,
  orders_count integer DEFAULT 0,
  revenue_total numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lto_variants table
CREATE TABLE IF NOT EXISTS lto_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES lto_offers(id) ON DELETE CASCADE,
  variant_label text NOT NULL,
  variant_description text,
  printful_product_id text,
  printful_variant_id text,
  price_cents integer NOT NULL,
  cost_cents integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  is_available boolean DEFAULT true,
  stock_limit integer,
  sold_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lto_offers_slug ON lto_offers(slug);
CREATE INDEX IF NOT EXISTS idx_lto_offers_status ON lto_offers(status);
CREATE INDEX IF NOT EXISTS idx_lto_offers_featured ON lto_offers(is_featured);
CREATE INDEX IF NOT EXISTS idx_lto_variants_offer_id ON lto_variants(offer_id);
CREATE INDEX IF NOT EXISTS idx_lto_variants_sort_order ON lto_variants(offer_id, sort_order);

-- Enable RLS
ALTER TABLE lto_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lto_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lto_offers
CREATE POLICY "Anyone can view active LTO offers"
  ON lto_offers FOR SELECT
  USING (status = 'active' OR status = 'ended');

CREATE POLICY "Admins can insert LTO offers"
  ON lto_offers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update LTO offers"
  ON lto_offers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete LTO offers"
  ON lto_offers FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for lto_variants
CREATE POLICY "Anyone can view LTO variants"
  ON lto_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lto_offers
      WHERE lto_offers.id = lto_variants.offer_id
      AND (lto_offers.status = 'active' OR lto_offers.status = 'ended')
    )
  );

CREATE POLICY "Admins can insert LTO variants"
  ON lto_variants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update LTO variants"
  ON lto_variants FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete LTO variants"
  ON lto_variants FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create helper functions

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_lto_views(offer_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lto_offers
  SET views_count = views_count + 1
  WHERE slug = offer_slug;
END;
$$;

-- Function to update order stats
CREATE OR REPLACE FUNCTION update_lto_order_stats(
  offer_uuid uuid,
  variant_uuid uuid,
  order_total numeric,
  item_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lto_offers
  SET 
    orders_count = orders_count + 1,
    revenue_total = revenue_total + order_total
  WHERE id = offer_uuid;

  UPDATE lto_variants
  SET sold_count = sold_count + item_quantity
  WHERE id = variant_uuid;
END;
$$;

-- Function to get campaign progress
CREATE OR REPLACE FUNCTION get_campaign_progress(offer_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_sold', COALESCE(SUM(v.sold_count), 0),
    'total_quantity_limit', o.target_quantity,
    'quantity_progress_percent', 
      CASE 
        WHEN o.target_quantity IS NOT NULL AND o.target_quantity > 0
        THEN (COALESCE(SUM(v.sold_count), 0)::float / o.target_quantity * 100)
        ELSE 0
      END,
    'revenue_total', o.revenue_total,
    'target_revenue_goal', o.target_revenue,
    'revenue_progress_percent',
      CASE
        WHEN o.target_revenue IS NOT NULL AND o.target_revenue > 0
        THEN (o.revenue_total::float / o.target_revenue * 100)
        ELSE 0
      END
  ) INTO result
  FROM lto_offers o
  LEFT JOIN lto_variants v ON v.offer_id = o.id
  WHERE o.id = offer_uuid
  GROUP BY o.id, o.target_quantity, o.target_revenue, o.revenue_total;

  RETURN result;
END;
$$;
