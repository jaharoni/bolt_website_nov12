/*
  # Base Tables for Media and Essays

  1. New Tables
    - `media_items`
      - `id` (uuid, primary key)
      - `title` (text) - Media title
      - `alt_text` (text) - Alt text for accessibility
      - `bucket_name` (text) - Supabase storage bucket
      - `storage_path` (text) - Path in storage
      - `public_url` (text) - Public URL
      - `media_type` (text) - Type: image, video, etc.
      - `file_size` (bigint) - File size in bytes
      - `width` (integer) - Image width
      - `height` (integer) - Image height
      - `page_context` (text) - Page association
      - `tags` (text[]) - Searchable tags
      - `is_active` (boolean) - Visibility control
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `essays`
      - `id` (uuid, primary key)
      - `title` (text) - Essay title
      - `slug` (text, unique) - URL-friendly identifier
      - `content` (text) - Essay content (markdown)
      - `excerpt` (text) - Short description
      - `featured_image_url` (text) - Cover image
      - `is_published` (boolean) - Publication status
      - `published_at` (timestamptz) - Publication date
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `media_folders`
      - `id` (uuid, primary key)
      - `name` (text) - Folder name
      - `parent_id` (uuid) - Parent folder for nesting
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public SELECT for active media and published essays
    - Authenticated users can manage all content
*/

-- Create media_folders table first (needed for media_items FK)
CREATE TABLE IF NOT EXISTS media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES media_folders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create media_items table
CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  alt_text text DEFAULT '',
  bucket_name text NOT NULL DEFAULT 'backgrounds',
  storage_path text NOT NULL,
  public_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  file_size bigint,
  width integer,
  height integer,
  page_context text,
  tags text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  folder_id uuid REFERENCES media_folders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  featured_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_items_bucket ON media_items(bucket_name);
CREATE INDEX IF NOT EXISTS idx_media_items_active ON media_items(is_active);
CREATE INDEX IF NOT EXISTS idx_media_items_tags ON media_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_items_folder ON media_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_essays_slug ON essays(slug);
CREATE INDEX IF NOT EXISTS idx_essays_published ON essays(is_published, published_at DESC);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS trg_media_items_updated ON media_items;
CREATE TRIGGER trg_media_items_updated
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_essays_updated ON essays;
CREATE TRIGGER trg_essays_updated
  BEFORE UPDATE ON essays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_folders
CREATE POLICY "Anyone can view media folders"
  ON media_folders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage folders"
  ON media_folders FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for media_items
CREATE POLICY "Anyone can view active media"
  ON media_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage media"
  ON media_items FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for essays
CREATE POLICY "Anyone can view published essays"
  ON essays FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage essays"
  ON essays FOR ALL
  USING (auth.role() = 'authenticated');

-- Create default "Backgrounds" folder
INSERT INTO media_folders (name, parent_id)
VALUES ('Backgrounds', NULL)
ON CONFLICT DO NOTHING;
