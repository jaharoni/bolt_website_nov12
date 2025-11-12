/*
  # Create LTO (Limited Time Offer) Tables

  1. New Tables
    - `lto_offers` - Campaign management
    - `lto_variants` - Product variants for each campaign

  2. Security
    - Enable RLS on both tables
    - Public read access for active campaigns
    - Authenticated users can manage campaigns
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

CREATE POLICY "Authenticated users can manage LTO offers"
  ON lto_offers FOR ALL
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

CREATE POLICY "Authenticated users can manage LTO variants"
  ON lto_variants FOR ALL
  USING (auth.role() = 'authenticated');
