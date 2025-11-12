/*
  # Add slug column to media_folders

  ## Purpose
  Adds a slug column to media_folders for URL-friendly lookups
  Generates slugs for existing folders

  ## Changes
  - Add slug column to media_folders table
  - Create unique index on slug
  - Generate slugs for existing folders
*/

-- Add slug column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_folders' AND column_name = 'slug'
  ) THEN
    ALTER TABLE media_folders ADD COLUMN slug text;
  END IF;
END $$;

-- Generate slugs for existing folders
UPDATE media_folders
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug column NOT NULL and UNIQUE
ALTER TABLE media_folders ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_folders_slug ON media_folders(slug);