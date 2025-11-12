/*
  # Enhanced Media Management and Zone Configuration System

  1. Zone Configuration Enhancements
    - Add randomization controls to site_zones
    - Add carousel configuration for homepage
    - Add static media option when randomization disabled

  2. New Tables
    - `media_usage_contexts` - Track where each media item is used
    - `page_background_history` - Track background display history for smart rotation
    - `media_ai_metadata` - Store AI-generated metadata (future feature)

  3. Security
    - Enable RLS on all new tables
    - Public can read active usage contexts
    - Authenticated users can manage (admin access)

  4. Indexes
    - Add indexes for performance on frequently queried fields
*/

-- Add new columns to site_zones for enhanced control
ALTER TABLE site_zones 
ADD COLUMN IF NOT EXISTS randomization_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS carousel_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS carousel_interval_ms integer DEFAULT 8000,
ADD COLUMN IF NOT EXISTS carousel_transition text DEFAULT 'fade',
ADD COLUMN IF NOT EXISTS static_media_id uuid REFERENCES media_items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS last_updated_by text;

-- Create media usage tracking table
CREATE TABLE IF NOT EXISTS media_usage_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('background', 'essay', 'gallery', 'product', 'general')),
  context_id text NOT NULL,
  context_name text,
  added_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_media_usage_media ON media_usage_contexts(media_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_context ON media_usage_contexts(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_active ON media_usage_contexts(is_active);

-- Create page background history table for smart rotation
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

-- Create AI metadata table (prepared for future AI integration)
CREATE TABLE IF NOT EXISTS media_ai_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  auto_title text,
  auto_description text,
  detected_objects jsonb DEFAULT '[]'::jsonb,
  detected_colors jsonb DEFAULT '[]'::jsonb,
  suggested_tags jsonb DEFAULT '[]'::jsonb,
  visual_categories jsonb DEFAULT '[]'::jsonb,
  mood_analysis jsonb DEFAULT '{}'::jsonb,
  content_analysis jsonb DEFAULT '{}'::jsonb,
  seo_score integer CHECK (seo_score >= 0 AND seo_score <= 100),
  accessibility_score integer CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
  ai_provider text,
  confidence_score float CHECK (confidence_score >= 0 AND confidence_score <= 1),
  generated_at timestamptz NOT NULL DEFAULT now(),
  applied_to_media boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ai_metadata_media ON media_ai_metadata(media_id);
CREATE INDEX IF NOT EXISTS idx_ai_metadata_applied ON media_ai_metadata(applied_to_media);

-- Enable RLS on new tables
ALTER TABLE media_usage_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_background_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_ai_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_usage_contexts
CREATE POLICY "Anyone can view active usage contexts"
  ON media_usage_contexts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert usage contexts"
  ON media_usage_contexts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update usage contexts"
  ON media_usage_contexts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete usage contexts"
  ON media_usage_contexts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for page_background_history
CREATE POLICY "Anyone can view background history"
  ON page_background_history FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert background history"
  ON page_background_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage background history"
  ON page_background_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for media_ai_metadata
CREATE POLICY "Anyone can view AI metadata"
  ON media_ai_metadata FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage AI metadata"
  ON media_ai_metadata FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to get recent backgrounds for a page (exclude from random selection)
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
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql;
