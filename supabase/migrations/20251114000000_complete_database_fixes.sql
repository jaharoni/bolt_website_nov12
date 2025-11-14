-- Complete Database Migration for Local and Production Environments
-- This migration brings any environment to full parity
-- Safe to run multiple times (idempotent)

-- =====================================================
-- 1. Fix site_zones table
-- =====================================================

-- Add randomization_enabled column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_zones' AND column_name = 'randomization_enabled'
  ) THEN
    ALTER TABLE public.site_zones ADD COLUMN randomization_enabled boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add static_media_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_zones' AND column_name = 'static_media_id'
  ) THEN
    ALTER TABLE public.site_zones ADD COLUMN static_media_id uuid;
    ALTER TABLE public.site_zones ADD CONSTRAINT site_zones_static_media_id_fkey 
      FOREIGN KEY (static_media_id) REFERENCES media_items(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update site_zones to reference 'backgrounds' folder in config
UPDATE public.site_zones
SET config_json = jsonb_set(
  COALESCE(config_json, '{}'::jsonb),
  '{folders}',
  '["backgrounds"]'::jsonb
)
WHERE config_json IS NULL OR NOT (config_json ? 'folders');

-- =====================================================
-- 2. Add slug column to media_folders
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_folders' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.media_folders ADD COLUMN slug text;
    ALTER TABLE public.media_folders ADD CONSTRAINT media_folders_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Update existing media_folders with slug values
UPDATE public.media_folders
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- =====================================================
-- 3. Create pages table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on pages table
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "pages_select_policy" ON public.pages;
DROP POLICY IF EXISTS "pages_manage_policy" ON public.pages;

-- Create RLS policies for pages
CREATE POLICY "pages_select_policy" 
  ON public.pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "pages_manage_policy" 
  ON public.pages FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. Create site_settings table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings table
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "site_settings_select_policy" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_manage_policy" ON public.site_settings;

-- Create RLS policies for site_settings
CREATE POLICY "site_settings_select_policy" 
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings_manage_policy" 
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default site settings if they don't exist
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('site_name', '"My Website"', 'The name of the website'),
  ('site_description', '"A beautiful website"', 'Site description for SEO')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 5. Create products table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2),
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_manage_policy" ON public.products;

-- Create RLS policies for products
CREATE POLICY "products_select_policy" 
  ON public.products FOR SELECT
  USING (is_available = true);

CREATE POLICY "products_manage_policy" 
  ON public.products FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. Create get_recent_backgrounds() function
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_recent_backgrounds(zone_key text, limit_count int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  url text,
  alt_text text,
  used_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    mi.id,
    mi.url,
    mi.alt_text,
    pbh.used_at
  FROM media_items mi
  JOIN page_background_history pbh ON mi.id = pbh.media_item_id
  WHERE pbh.zone_key = get_recent_backgrounds.zone_key
  ORDER BY pbh.used_at DESC
  LIMIT limit_count;
END;
$$;

-- =====================================================
-- 7. Seed background images
-- =====================================================

-- First, ensure 'backgrounds' folder exists
INSERT INTO public.media_folders (name, slug, description)
VALUES ('Backgrounds', 'backgrounds', 'Background images for site zones')
ON CONFLICT (slug) DO NOTHING;

-- Get the backgrounds folder ID
DO $$
DECLARE
  v_folder_id uuid;
BEGIN
  SELECT id INTO v_folder_id FROM public.media_folders WHERE slug = 'backgrounds';
  
  -- Insert 10 professional background images if they don't already exist
  INSERT INTO public.media_items (url, alt_text, folder_id)
  SELECT * FROM (
    VALUES 
      ('https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg', 'Abstract gradient waves', v_folder_id),
      ('https://images.pexels.com/photos/3137078/pexels-photo-3137078.jpeg', 'Soft pastel gradient', v_folder_id),
      ('https://images.pexels.com/photos/4114713/pexels-photo-4114713.jpeg', 'Mountain landscape', v_folder_id),
      ('https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg', 'Ocean waves', v_folder_id),
      ('https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg', 'Forest path', v_folder_id),
      ('https://images.pexels.com/photos/1426718/pexels-photo-1426718.jpeg', 'City lights', v_folder_id),
      ('https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg', 'Desert dunes', v_folder_id),
      ('https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg', 'Starry night', v_folder_id),
      ('https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg', 'Autumn leaves', v_folder_id),
      ('https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg', 'Mountain vista', v_folder_id)
  ) AS new_images(url, alt_text, folder_id)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.media_items mi2 
    WHERE mi2.url = new_images.url
  );
END $$;

-- =====================================================
-- 8. Reload PostgREST schema cache
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 9. Verification queries
-- =====================================================

-- Verify all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('site_zones', 'media_items', 'media_folders', 'pages', 'site_settings', 'products', 'page_background_history', 'essays')
ORDER BY table_name;

-- Verify site_zones has required columns
SELECT 
  key,
  randomization_enabled,
  config_json->>'folders' as folders
FROM public.site_zones;

-- Verify background images are seeded
SELECT COUNT(*) as background_image_count
FROM public.media_items mi
JOIN public.media_folders mf ON mi.folder_id = mf.id
WHERE mf.slug = 'backgrounds';
