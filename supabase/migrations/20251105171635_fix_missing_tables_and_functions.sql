/*
  # Fix Missing Tables and Functions
  
  This migration adds all missing database tables and functions that the application code expects.
  
  ## New Tables
  1. **gallery_projects** - Organize gallery images into themed projects/collections
     - id, title, slug, category, description
     - thumbnail_media_id (references media_items)
     - is_featured, is_active, sort_order
     - timestamps
  
  2. **project_media** - Junction table linking projects to media items
     - project_id, media_id
     - sort_order for ordering images within a project
  
  3. **page_background_history** - Track which backgrounds were shown to avoid repetition
     - page_key, media_id, shown_at
     - session_id for user session tracking
  
  ## New Functions
  1. **get_recent_backgrounds** - Returns recently shown background IDs for a page
  2. **record_background_view** - Records when a background is displayed
  
  ## Security
  - All tables have RLS enabled
  - Public can view active gallery projects and their media
  - Authenticated users can manage everything
  - Background history is publicly readable for the tracking system
*/

-- Create gallery_projects table
CREATE TABLE IF NOT EXISTS gallery_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'general',
  description text,
  thumbnail_media_id uuid REFERENCES media_items(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_projects_slug ON gallery_projects(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_category ON gallery_projects(category);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_active ON gallery_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_sort ON gallery_projects(sort_order);

-- Create project_media junction table
CREATE TABLE IF NOT EXISTS project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES gallery_projects(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_media ON project_media(media_id);
CREATE INDEX IF NOT EXISTS idx_project_media_sort ON project_media(project_id, sort_order);

-- Create page_background_history table
CREATE TABLE IF NOT EXISTS page_background_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  shown_at timestamptz NOT NULL DEFAULT now(),
  session_id text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_bg_history_page_time ON page_background_history(page_key, shown_at DESC);
CREATE INDEX IF NOT EXISTS idx_bg_history_media ON page_background_history(media_id);
CREATE INDEX IF NOT EXISTS idx_bg_history_session ON page_background_history(session_id);

-- Enable RLS
ALTER TABLE gallery_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_background_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gallery_projects
CREATE POLICY "Anyone can view active gallery projects"
  ON gallery_projects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage gallery projects"
  ON gallery_projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for project_media
CREATE POLICY "Anyone can view project media for active projects"
  ON project_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_projects
      WHERE gallery_projects.id = project_media.project_id
      AND gallery_projects.is_active = true
    )
  );

CREATE POLICY "Authenticated users can manage project media"
  ON project_media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for page_background_history
CREATE POLICY "Anyone can view background history"
  ON page_background_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert background history"
  ON page_background_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage background history"
  ON page_background_history FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to get recent backgrounds for a page
CREATE OR REPLACE FUNCTION get_recent_backgrounds(p_page_key text, p_limit integer DEFAULT 5)
RETURNS TABLE (media_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pbh.media_id
  FROM page_background_history pbh
  WHERE pbh.page_key = p_page_key
  ORDER BY pbh.shown_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record background view
CREATE OR REPLACE FUNCTION record_background_view(
  p_page_key text,
  p_media_id uuid,
  p_session_id text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO page_background_history (page_key, media_id, session_id)
  VALUES (p_page_key, p_media_id, p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to gallery_projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'gallery_projects_updated_at'
  ) THEN
    CREATE TRIGGER gallery_projects_updated_at
      BEFORE UPDATE ON gallery_projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;
