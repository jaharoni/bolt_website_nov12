/*
  # Advanced Admin Tables - Galleries, Zones, Text Blocks

  1. New Tables
    - `essays_media` - Junction table for essay-media relationships
    - `galleries` - Gallery collections
    - `gallery_items` - Gallery-media junction table
    - `site_zones` - Zone configurations for backgrounds/content
    - `text_blocks` - Editable text content blocks

  2. Security
    - Enable RLS on all tables
    - Public read access where appropriate
    - Authenticated users can manage all content
*/

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

-- Apply triggers (reuse existing function)
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
ALTER TABLE essays_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_blocks ENABLE ROW LEVEL SECURITY;

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
