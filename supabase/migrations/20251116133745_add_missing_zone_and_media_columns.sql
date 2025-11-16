/*
  # Add Missing Columns to site_zones and media_items
  
  1. Changes to site_zones table
    - Add `carousel_enabled` (boolean) - enables background carousel rotation
    - Add `carousel_interval_ms` (integer) - interval between carousel transitions in milliseconds
    - Add `carousel_transition` (text) - transition effect type (fade, slide, zoom)
    - Add `static_media_id` (uuid) - reference to a specific media item for static backgrounds
  
  2. Changes to media_items table
    - Add `filename` (text) - original filename of the uploaded media
    - Add `description` (text) - detailed description for the media item
    - Add `mime_type` (text) - MIME type of the media file
  
  3. Security
    - All columns are nullable to maintain backward compatibility
    - No RLS policy changes needed
*/

-- Add missing columns to site_zones
ALTER TABLE site_zones
  ADD COLUMN IF NOT EXISTS carousel_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS carousel_interval_ms integer DEFAULT 8000,
  ADD COLUMN IF NOT EXISTS carousel_transition text DEFAULT 'fade',
  ADD COLUMN IF NOT EXISTS static_media_id uuid REFERENCES media_items(id) ON DELETE SET NULL;

-- Add missing columns to media_items
ALTER TABLE media_items
  ADD COLUMN IF NOT EXISTS filename text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS mime_type text;

-- Update filename from storage_path for existing records (extract filename from path)
UPDATE media_items
SET filename = COALESCE(
  filename,
  regexp_replace(storage_path, '^.*/([^/]+)$', '\1')
)
WHERE filename IS NULL AND storage_path IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN site_zones.carousel_enabled IS 'When true, backgrounds rotate automatically while on the page';
COMMENT ON COLUMN site_zones.carousel_interval_ms IS 'Milliseconds between background transitions in carousel mode';
COMMENT ON COLUMN site_zones.carousel_transition IS 'Transition effect: fade, slide, or zoom';
COMMENT ON COLUMN site_zones.static_media_id IS 'When randomization is disabled, use this specific media item';

COMMENT ON COLUMN media_items.filename IS 'Original filename of the uploaded file';
COMMENT ON COLUMN media_items.description IS 'Detailed description of the media item';
COMMENT ON COLUMN media_items.mime_type IS 'MIME type of the media file (e.g., image/jpeg, video/mp4)';
