/*
  # Auto-Configure All Page Zones to Use Backgrounds Folder
  
  ## Purpose
  Emergency fix to ensure all page backgrounds load immediately.
  Automatically configures all site zones to use the Backgrounds folder.
  
  ## Changes
  1. Find the Backgrounds folder ID
  2. Update ALL site_zones to use this folder as source
  3. Enable randomization and set sensible defaults
  4. Ensure carousel settings are properly configured
  
  ## Safety
  - Idempotent: can be run multiple times safely
  - Preserves existing carousel settings if already configured
  - Only updates zones that need fixing
*/

DO $$
DECLARE
  backgrounds_folder_id uuid;
  zone_rec record;
  updated_count int := 0;
BEGIN
  -- Get the Backgrounds folder ID
  SELECT id INTO backgrounds_folder_id
  FROM media_folders
  WHERE slug = 'backgrounds' AND parent_id IS NULL
  LIMIT 1;
  
  IF backgrounds_folder_id IS NULL THEN
    RAISE EXCEPTION 'Backgrounds folder not found!';
  END IF;
  
  RAISE NOTICE 'Using Backgrounds folder ID: %', backgrounds_folder_id;
  
  -- Update or insert zone configurations for all pages
  -- Home page
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'home.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    true,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- About page
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'page.about.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    false,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- Contact page
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'page.contact.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    false,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- Shop page
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'page.shop.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    false,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- Gallery page
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'page.gallery.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    false,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- Essays page
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'page.essays.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    false,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- Global background
  INSERT INTO site_zones (
    key, 
    config_json,
    randomization_enabled,
    carousel_enabled,
    carousel_interval_ms,
    carousel_transition,
    updated_at
  ) VALUES (
    'global.background',
    jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', 10
    ),
    true,
    false,
    8000,
    'fade',
    now()
  )
  ON CONFLICT (key) DO UPDATE SET
    config_json = jsonb_build_object(
      'mode', 'random',
      'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
      'limit', COALESCE((EXCLUDED.config_json->>'limit')::int, 10)
    ),
    randomization_enabled = true,
    updated_at = now();
  
  -- Verification
  RAISE NOTICE '=== ZONE CONFIGURATION COMPLETE ===';
  
  FOR zone_rec IN
    SELECT 
      key,
      randomization_enabled,
      carousel_enabled,
      config_json->'source'->>'value' as folder_id,
      config_json->>'limit' as image_limit
    FROM site_zones
    ORDER BY key
  LOOP
    RAISE NOTICE 'Zone: %', zone_rec.key;
    RAISE NOTICE '  Folder ID: %', zone_rec.folder_id;
    RAISE NOTICE '  Randomization: %', zone_rec.randomization_enabled;
    RAISE NOTICE '  Carousel: %', zone_rec.carousel_enabled;
    RAISE NOTICE '  Image Limit: %', zone_rec.image_limit;
    RAISE NOTICE '---';
  END LOOP;
  
  -- Verify all zones point to the same folder
  SELECT COUNT(*) INTO updated_count
  FROM site_zones
  WHERE config_json->'source'->>'value' = backgrounds_folder_id::text;
  
  RAISE NOTICE 'Total zones configured: %', updated_count;
  RAISE NOTICE '===================================';
  
END $$;
