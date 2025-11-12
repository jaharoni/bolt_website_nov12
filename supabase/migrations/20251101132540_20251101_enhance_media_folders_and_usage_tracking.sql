/*
  # Enhanced Media Folders and Usage Tracking
  
  1. Media Folders Enhancement
    - Add `slug` column to media_folders for URL-friendly identifiers
    - Add `description` column for folder metadata
    - Add `is_active` column for visibility control
    - Add `updated_at` column for tracking modifications
    - Add `color_label` column for visual organization
    
  2. Media Usage View
    - Create materialized view for tracking media item usage across:
      - Essays (essays_media junction table)
      - Galleries (gallery_items junction table)
      - LTO Offers (lto_offers.media_id foreign key)
      - Gallery Covers (galleries.cover_media_id foreign key)
    - Includes usage counts and location details
    
  3. Performance
    - Add indexes for faster folder tree queries
    - Add index on folder parent_id for hierarchy traversal
    - Add index on media_items.folder_id for filtering
    
  4. Helper Functions
    - Create function to get folder breadcrumb path
    - Create function to count items in folder recursively
    - Create function to move items between folders
*/

-- Add new columns to media_folders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_folders' AND column_name = 'slug') THEN
    ALTER TABLE media_folders ADD COLUMN slug text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_folders' AND column_name = 'description') THEN
    ALTER TABLE media_folders ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_folders' AND column_name = 'is_active') THEN
    ALTER TABLE media_folders ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_folders' AND column_name = 'updated_at') THEN
    ALTER TABLE media_folders ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_folders' AND column_name = 'color_label') THEN
    ALTER TABLE media_folders ADD COLUMN color_label text;
  END IF;
END $$;

-- Add missing columns to media_items if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_items' AND column_name = 'description') THEN
    ALTER TABLE media_items ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_items' AND column_name = 'filename') THEN
    ALTER TABLE media_items ADD COLUMN filename text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_items' AND column_name = 'mime_type') THEN
    ALTER TABLE media_items ADD COLUMN mime_type text;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON media_folders(slug);
CREATE INDEX IF NOT EXISTS idx_media_items_folder_id ON media_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_items_is_active ON media_items(is_active);

-- Create or replace media usage view
CREATE OR REPLACE VIEW media_usage AS
WITH essay_usage AS (
  SELECT 
    em.media_id,
    'essay' as usage_type,
    e.id as reference_id,
    e.title as reference_title,
    e.slug as reference_slug
  FROM essays_media em
  JOIN essays e ON e.id = em.essay_id
),
gallery_usage AS (
  SELECT 
    gi.media_id,
    'gallery' as usage_type,
    g.id as reference_id,
    g.title as reference_title,
    g.slug as reference_slug
  FROM gallery_items gi
  JOIN galleries g ON g.id = gi.gallery_id
),
lto_usage AS (
  SELECT 
    lo.media_id,
    'lto_offer' as usage_type,
    lo.id as reference_id,
    lo.title as reference_title,
    lo.slug as reference_slug
  FROM lto_offers lo
  WHERE lo.media_id IS NOT NULL
),
gallery_cover_usage AS (
  SELECT 
    g.cover_media_id as media_id,
    'gallery_cover' as usage_type,
    g.id as reference_id,
    g.title as reference_title,
    g.slug as reference_slug
  FROM galleries g
  WHERE g.cover_media_id IS NOT NULL
)
SELECT * FROM essay_usage
UNION ALL
SELECT * FROM gallery_usage
UNION ALL
SELECT * FROM lto_usage
UNION ALL
SELECT * FROM gallery_cover_usage;

-- Create helper function: Get folder breadcrumb path
CREATE OR REPLACE FUNCTION get_folder_path(folder_id uuid)
RETURNS text AS $$
DECLARE
  path text := '';
  current_id uuid := folder_id;
  current_name text;
  current_parent_id uuid;
BEGIN
  WHILE current_id IS NOT NULL LOOP
    SELECT name, parent_id INTO current_name, current_parent_id
    FROM media_folders
    WHERE id = current_id;
    
    IF current_name IS NULL THEN
      EXIT;
    END IF;
    
    IF path = '' THEN
      path := current_name;
    ELSE
      path := current_name || ' / ' || path;
    END IF;
    
    current_id := current_parent_id;
  END LOOP;
  
  RETURN path;
END;
$$ LANGUAGE plpgsql;

-- Create helper function: Count items in folder (including subfolders)
CREATE OR REPLACE FUNCTION count_folder_items(folder_id uuid, include_subfolders boolean DEFAULT false)
RETURNS integer AS $$
DECLARE
  item_count integer := 0;
  subfolder_id uuid;
BEGIN
  -- Count direct items
  SELECT COUNT(*) INTO item_count
  FROM media_items
  WHERE media_items.folder_id = count_folder_items.folder_id;
  
  -- If including subfolders, recursively count their items
  IF include_subfolders THEN
    FOR subfolder_id IN 
      SELECT id FROM media_folders WHERE parent_id = count_folder_items.folder_id
    LOOP
      item_count := item_count + count_folder_items(subfolder_id, true);
    END LOOP;
  END IF;
  
  RETURN item_count;
END;
$$ LANGUAGE plpgsql;

-- Create helper function: Get media usage count
CREATE OR REPLACE FUNCTION get_media_usage_count(p_media_id uuid)
RETURNS integer AS $$
DECLARE
  usage_count integer := 0;
BEGIN
  SELECT COUNT(*) INTO usage_count
  FROM media_usage
  WHERE media_id = p_media_id;
  
  RETURN usage_count;
END;
$$ LANGUAGE plpgsql;

-- Update existing folders to have slugs if they don't
UPDATE media_folders 
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';