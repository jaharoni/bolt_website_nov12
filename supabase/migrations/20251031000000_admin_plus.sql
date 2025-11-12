/*
  # Advanced Admin System - Media Folders, Galleries, Zones & Text Blocks

  1. New Tables
    - `media_folders`
      - `id` (uuid, primary key)
      - `name` (text) - Folder name
      - `parent_id` (uuid, nullable) - Parent folder for nesting
      - `created_at` (timestamptz)

    - `essays_media` (junction table)
      - `id` (uuid, primary key)
      - `essay_id` (uuid, foreign key)
      - `media_id` (uuid, foreign key)
      - `position` (integer) - Display order
      - Unique constraint on (essay_id, media_id)

    - `galleries`
      - `id` (uuid, primary key)
      - `title` (text) - Gallery title
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text, nullable)
      - `cover_media_id` (uuid, nullable) - Featured image
      - `is_active` (boolean) - Visibility control
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gallery_items` (junction table)
      - `id` (uuid, primary key)
      - `gallery_id` (uuid, foreign key)
      - `media_id` (uuid, foreign key)
      - `position` (integer) - Display order
      - Unique constraint on (gallery_id, media_id)

    - `site_zones`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Zone identifier (e.g., 'home.background')
      - `config_json` (jsonb) - Zone configuration (mode, source, limits)
      - `updated_at` (timestamptz)

    - `text_blocks`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Content key (e.g., 'home.hero.subtitle')
      - `content_md` (text) - Markdown content
      - `updated_at` (timestamptz)

  2. Schema Changes
    - Add `folder_id` column to existing `media_items` table

  3. Security
    - Enable RLS on all new tables
    - Public SELECT on is_active galleries, all zones and text blocks
    - Authenticated users can INSERT/UPDATE/DELETE (admin access)

  4. Initial Data
    - Create default "The Well" root folder
    - Migrate existing media to "The Well"
*/

-- Create media_folders table
CREATE TABLE IF NOT EXISTS media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES media_folders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add folder_id to media_items
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES media_folders(id) ON DELETE SET NULL;

-- Create essays_media junction table
CREATE TABLE IF NOT EXISTS essays_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (essay_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_essays_media_essay ON essays_media(essay_id);

-- Create galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_media_id uuid REFERENCES media_items(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create gallery_items junction table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (gallery_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery ON gallery_items(gallery_id);

-- Create site_zones table
CREATE TABLE IF NOT EXISTS site_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create text_blocks table
CREATE TABLE IF NOT EXISTS text_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  content_md text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create trigger function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS trg_galleries_updated ON galleries;
CREATE TRIGGER trg_galleries_updated
  BEFORE UPDATE ON galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_site_zones_updated ON site_zones;
CREATE TRIGGER trg_site_zones_updated
  BEFORE UPDATE ON site_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_text_blocks_updated ON text_blocks;
CREATE TRIGGER trg_text_blocks_updated
  BEFORE UPDATE ON text_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_folders
CREATE POLICY "Anyone can view media folders"
  ON media_folders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage folders"
  ON media_folders FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for essays_media
CREATE POLICY "Anyone can view essay media"
  ON essays_media FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage essay media"
  ON essays_media FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for galleries
CREATE POLICY "Anyone can view active galleries"
  ON galleries FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage galleries"
  ON galleries FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for gallery_items
CREATE POLICY "Anyone can view gallery items"
  ON gallery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_items.gallery_id
      AND galleries.is_active = true
    )
  );

CREATE POLICY "Authenticated users can manage gallery items"
  ON gallery_items FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for site_zones
CREATE POLICY "Anyone can view site zones"
  ON site_zones FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage zones"
  ON site_zones FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for text_blocks
CREATE POLICY "Anyone can view text blocks"
  ON text_blocks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage text blocks"
  ON text_blocks FOR ALL
  USING (auth.role() = 'authenticated');

-- Create default "The Well" folder
INSERT INTO media_folders (name, parent_id)
VALUES ('The Well', NULL)
ON CONFLICT DO NOTHING;

-- Migrate existing media to "The Well"
DO $$
DECLARE
  well_folder_id uuid;
BEGIN
  SELECT id INTO well_folder_id FROM media_folders WHERE name = 'The Well' AND parent_id IS NULL LIMIT 1;

  IF well_folder_id IS NOT NULL THEN
    UPDATE media_items
    SET folder_id = well_folder_id
    WHERE folder_id IS NULL;
  END IF;
END $$;
