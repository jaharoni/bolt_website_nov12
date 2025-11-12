/*
  # Backgrounds Folder and Usage Tracking System

  1. Initial Data
    - Create "Backgrounds" folder in media_folders
    - Ensure "The Well" folder exists as catch-all

  2. New Features
    - Add usage tracking view to show which zones reference each media item
    - Add helper function to get media usage information

  3. Notes
    - Backwards compatible with existing media_items
    - No breaking changes to existing tables
    - Provides foundation for usage indicators in admin UI
*/

-- Create "Backgrounds" folder if it doesn't exist
DO $$
DECLARE
  backgrounds_folder_id uuid;
  well_folder_id uuid;
BEGIN
  -- Check if "Backgrounds" folder exists
  SELECT id INTO backgrounds_folder_id FROM media_folders WHERE name = 'Backgrounds' AND parent_id IS NULL LIMIT 1;

  IF backgrounds_folder_id IS NULL THEN
    INSERT INTO media_folders (name, slug, parent_id, is_active)
    VALUES ('Backgrounds', 'backgrounds', NULL, true)
    RETURNING id INTO backgrounds_folder_id;
  END IF;

  -- Ensure "The Well" exists
  SELECT id INTO well_folder_id FROM media_folders WHERE name = 'The Well' AND parent_id IS NULL LIMIT 1;

  IF well_folder_id IS NULL THEN
    INSERT INTO media_folders (name, slug, parent_id, is_active)
    VALUES ('The Well', 'the-well', NULL, true)
    RETURNING id INTO well_folder_id;
  END IF;

  -- Update any orphaned media_items to "The Well"
  UPDATE media_items
  SET folder_id = well_folder_id
  WHERE folder_id IS NULL;
END $$;

-- Create a view for media usage tracking
CREATE OR REPLACE VIEW media_usage_summary AS
SELECT
  mi.id as media_id,
  mi.filename,
  mi.title,
  mi.bucket_name,
  mi.folder_id,
  -- Count zone references
  (
    SELECT COUNT(DISTINCT sz.id)
    FROM site_zones sz
    WHERE sz.config_json->>'source' IS NOT NULL
      AND (
        (sz.config_json->'source'->>'type' = 'folder' AND sz.config_json->'source'->>'value' = mi.folder_id::text)
        OR (sz.config_json->'source'->>'type' = 'tag' AND mi.tags @> ARRAY[sz.config_json->'source'->>'value'])
      )
  ) as zone_count,
  -- Count gallery references
  (
    SELECT COUNT(DISTINCT gi.gallery_id)
    FROM gallery_items gi
    WHERE gi.media_id = mi.id
  ) as gallery_count,
  -- Count essay references
  (
    SELECT COUNT(DISTINCT em.essay_id)
    FROM essays_media em
    WHERE em.media_id = mi.id
  ) as essay_count,
  -- Check if used as gallery cover
  (
    SELECT COUNT(*)
    FROM galleries g
    WHERE g.cover_media_id = mi.id
  ) > 0 as is_gallery_cover,
  -- Determine if actively used
  (
    SELECT COUNT(*) > 0
    FROM (
      SELECT 1 FROM gallery_items gi WHERE gi.media_id = mi.id LIMIT 1
      UNION ALL
      SELECT 1 FROM essays_media em WHERE em.media_id = mi.id LIMIT 1
      UNION ALL
      SELECT 1 FROM galleries g WHERE g.cover_media_id = mi.id LIMIT 1
    ) as usage
  ) as is_used
FROM media_items mi;

-- Create a function to get zone keys that reference a specific media item
CREATE OR REPLACE FUNCTION get_media_zone_references(media_item_id uuid)
RETURNS TABLE(zone_key text, zone_type text, page_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sz.key as zone_key,
    sz.config_json->'source'->>'type' as zone_type,
    CASE
      WHEN sz.key LIKE 'page.%.background' THEN split_part(sz.key, '.', 2)
      WHEN sz.key = 'home.background' THEN 'home'
      ELSE sz.key
    END as page_name
  FROM site_zones sz
  JOIN media_items mi ON mi.id = media_item_id
  WHERE sz.config_json->>'source' IS NOT NULL
    AND (
      -- Folder-based zones
      (sz.config_json->'source'->>'type' = 'folder'
       AND sz.config_json->'source'->>'value' = mi.folder_id::text)
      -- Tag-based zones
      OR (sz.config_json->'source'->>'type' = 'tag'
          AND mi.tags @> ARRAY[sz.config_json->'source'->>'value'])
      -- Gallery-based zones (check if media is in that gallery)
      OR (sz.config_json->'source'->>'type' = 'gallery'
          AND EXISTS (
            SELECT 1 FROM gallery_items gi
            WHERE gi.gallery_id::text = sz.config_json->'source'->>'value'
              AND gi.media_id = mi.id
          ))
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment to media_items table
COMMENT ON TABLE media_items IS 'Media library items with folder organization and usage tracking';
COMMENT ON COLUMN media_items.folder_id IS 'References media_folders - NULL items automatically moved to "The Well"';
COMMENT ON COLUMN media_items.tags IS 'Array of tags used for zone filtering and search';
COMMENT ON COLUMN media_items.page_context IS 'Legacy field - prefer using folders and zones';

-- Grant access to the view and function
GRANT SELECT ON media_usage_summary TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_media_zone_references(uuid) TO authenticated, anon;
