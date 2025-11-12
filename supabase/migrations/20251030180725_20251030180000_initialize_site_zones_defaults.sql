/*
  # Initialize Site Zones with Default Background Configuration

  1. Purpose
    - Populate site_zones table with default page background configurations
    - Configure all pages to use the "Backgrounds" folder by default
    - Enable immediate background loading across all pages

  2. Zone Keys
    - home.background: Homepage background images
    - page.about.background: About page backgrounds
    - page.contact.background: Contact page backgrounds
    - page.shop.background: Shop page backgrounds
    - page.gallery.background: Gallery page backgrounds
    - page.essays.background: Essays page backgrounds
    - global.background: Fallback for all pages

  3. Configuration Structure
    - source.type: 'folder' (can also be 'tag' or 'gallery')
    - source.value: UUID of the folder to pull images from
    - display.mode: 'random' or 'carousel'
    - display.interval: milliseconds between image changes (for carousel)

  4. Notes
    - Uses the existing "Backgrounds" folder (slug: 'backgrounds')
    - All pages configured to random mode by default
    - Backwards compatible with existing page_context fallback
*/

DO $$
DECLARE
  backgrounds_folder_id uuid;
BEGIN
  -- Get the Backgrounds folder ID
  SELECT id INTO backgrounds_folder_id
  FROM media_folders
  WHERE slug = 'backgrounds' AND parent_id IS NULL
  LIMIT 1;

  -- If Backgrounds folder doesn't exist, create it
  IF backgrounds_folder_id IS NULL THEN
    INSERT INTO media_folders (name, slug, description, color, icon, sort_order, is_active)
    VALUES ('Backgrounds', 'backgrounds', 'Background images for website pages', '#3B82F6', 'image', 1, true)
    RETURNING id INTO backgrounds_folder_id;
  END IF;

  -- Insert default zone configurations
  -- Only insert if they don't already exist
  
  -- Home page background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'home.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  -- About page background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'page.about.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  -- Contact page background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'page.contact.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  -- Shop page background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'page.shop.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  -- Gallery page background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'page.gallery.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  -- Essays page background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'page.essays.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  -- Global fallback background
  INSERT INTO site_zones (key, config_json)
  VALUES (
    'global.background',
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'folder',
        'value', backgrounds_folder_id::text
      ),
      'display', jsonb_build_object(
        'mode', 'random',
        'interval', 5000
      )
    )
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    updated_at = now();

  RAISE NOTICE 'Site zones initialized with Backgrounds folder: %', backgrounds_folder_id;
END $$;

-- Update existing background images to be in the Backgrounds folder if they're not already
UPDATE media_items
SET folder_id = (SELECT id FROM media_folders WHERE slug = 'backgrounds' LIMIT 1)
WHERE bucket_name = 'backgrounds'
  AND page_context = 'background'
  AND (folder_id IS NULL OR folder_id = (SELECT id FROM media_folders WHERE slug = 'the-well' LIMIT 1));

-- Add helpful comments
COMMENT ON TABLE site_zones IS 'Page-level configuration for dynamic content zones (backgrounds, featured content, etc.)';
COMMENT ON COLUMN site_zones.key IS 'Unique zone identifier (e.g., "home.background", "page.about.background")';
COMMENT ON COLUMN site_zones.config_json IS 'JSON configuration: {source: {type, value}, display: {mode, interval}}';
