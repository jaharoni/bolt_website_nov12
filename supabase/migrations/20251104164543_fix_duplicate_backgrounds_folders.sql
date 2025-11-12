/*
  # Fix Duplicate 'Backgrounds' Folders
  
  ## Problem
  Two 'Backgrounds' folders exist in the database:
    - Folder 1 (3d01a7a1-7767-4b47-8c0e-0727c4c96184): Empty, 0 images
    - Folder 2 (b7e2210c-3a60-4d54-9a23-9db42861630a): Contains 14 images
  
  ## Solution
  1. Keep Folder 2 (the one with images)
  2. Update global.background zone to point to Folder 2
  3. Delete empty Folder 1
  4. Add unique constraint on media_folders.slug to prevent future duplicates
  
  ## Changes Made
  - Update site_zones: Fix global.background zone configuration
  - Delete duplicate empty Backgrounds folder
  - Add unique constraint on media_folders(slug) where parent_id IS NULL
  - Add unique constraint on media_folders(name, parent_id) combination
  
  ## Safety
  - Uses IF EXISTS/NOT EXISTS checks to ensure idempotency
  - Only deletes folders with 0 images
  - Updates zone configurations atomically
  - Adds constraints to prevent future issues
*/

-- Step 1: Identify the correct folder (the one with images)
DO $$
DECLARE
  correct_folder_id uuid;
  empty_folder_id uuid;
  zone_update_count int;
BEGIN
  -- Find the folder with images (should be b7e2210c-3a60-4d54-9a23-9db42861630a)
  SELECT id INTO correct_folder_id
  FROM media_folders
  WHERE LOWER(name) = 'backgrounds' 
    AND parent_id IS NULL
  ORDER BY (SELECT COUNT(*) FROM media_items WHERE folder_id = media_folders.id) DESC
  LIMIT 1;
  
  RAISE NOTICE 'Correct Backgrounds folder ID: %', correct_folder_id;
  
  -- Find all duplicate empty folders
  FOR empty_folder_id IN
    SELECT id 
    FROM media_folders
    WHERE LOWER(name) = 'backgrounds'
      AND parent_id IS NULL
      AND id != correct_folder_id
      AND (SELECT COUNT(*) FROM media_items WHERE folder_id = media_folders.id) = 0
  LOOP
    RAISE NOTICE 'Found empty duplicate folder: %', empty_folder_id;
    
    -- Update any zone configurations pointing to the empty folder
    UPDATE site_zones
    SET 
      config_json = jsonb_set(
        config_json,
        '{source,value}',
        to_jsonb(correct_folder_id::text)
      ),
      updated_at = now()
    WHERE config_json->'source'->>'type' = 'folder'
      AND config_json->'source'->>'value' = empty_folder_id::text;
    
    GET DIAGNOSTICS zone_update_count = ROW_COUNT;
    RAISE NOTICE 'Updated % zone configurations', zone_update_count;
    
    -- Update any media items pointing to the empty folder (shouldn't be any, but just in case)
    UPDATE media_items
    SET folder_id = correct_folder_id
    WHERE folder_id = empty_folder_id;
    
    -- Delete the empty duplicate folder
    DELETE FROM media_folders WHERE id = empty_folder_id;
    RAISE NOTICE 'Deleted empty duplicate folder: %', empty_folder_id;
  END LOOP;
  
  -- Verify only one Backgrounds folder remains
  IF (SELECT COUNT(*) FROM media_folders WHERE LOWER(name) = 'backgrounds' AND parent_id IS NULL) = 1 THEN
    RAISE NOTICE 'SUCCESS: Only one Backgrounds folder remains';
  ELSE
    RAISE WARNING 'Multiple Backgrounds folders still exist!';
  END IF;
  
END $$;

-- Step 2: Add unique constraint on slug for root-level folders
-- This prevents duplicate folder names at the root level
DO $$
BEGIN
  -- Drop existing index on slug if it exists (non-unique)
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_media_folders_slug'
  ) THEN
    DROP INDEX IF EXISTS idx_media_folders_slug;
  END IF;
  
  -- Create unique partial index: slug must be unique for root folders (parent_id IS NULL)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'media_folders_slug_root_unique'
  ) THEN
    CREATE UNIQUE INDEX media_folders_slug_root_unique 
    ON media_folders(slug) 
    WHERE parent_id IS NULL;
    RAISE NOTICE 'Created unique constraint on media_folders.slug for root folders';
  END IF;
END $$;

-- Step 3: Add unique constraint on name + parent_id combination
-- This prevents folders with the same name within the same parent folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'media_folders_name_parent_unique'
  ) THEN
    CREATE UNIQUE INDEX media_folders_name_parent_unique 
    ON media_folders(LOWER(name), COALESCE(parent_id::text, 'root'));
    RAISE NOTICE 'Created unique constraint on media_folders(name, parent_id)';
  END IF;
END $$;

-- Step 4: Ensure all existing folders have slugs
UPDATE media_folders 
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Step 5: Final verification query
DO $$
DECLARE
  backgrounds_count int;
  folder_info record;
BEGIN
  -- Count Backgrounds folders
  SELECT COUNT(*) INTO backgrounds_count
  FROM media_folders
  WHERE LOWER(name) = 'backgrounds' AND parent_id IS NULL;
  
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Total Backgrounds folders: %', backgrounds_count;
  
  -- Get details of remaining Backgrounds folder(s)
  FOR folder_info IN
    SELECT 
      id,
      name,
      slug,
      (SELECT COUNT(*) FROM media_items WHERE folder_id = media_folders.id) as image_count,
      (SELECT COUNT(*) FROM site_zones WHERE config_json->'source'->>'value' = media_folders.id::text) as zone_count
    FROM media_folders
    WHERE LOWER(name) = 'backgrounds' AND parent_id IS NULL
  LOOP
    RAISE NOTICE 'Folder: % (ID: %)', folder_info.name, folder_info.id;
    RAISE NOTICE '  - Slug: %', folder_info.slug;
    RAISE NOTICE '  - Images: %', folder_info.image_count;
    RAISE NOTICE '  - Referenced by % zones', folder_info.zone_count;
  END LOOP;
  
  RAISE NOTICE '=========================';
END $$;
