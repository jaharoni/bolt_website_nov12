-- ============================================================================
-- Full schema sync for background zones & helpers
-- Run this script on any Supabase project missing the latest zone schema.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Zone table + metadata
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  randomization_enabled boolean NOT NULL DEFAULT true,
  carousel_enabled boolean NOT NULL DEFAULT false,
  carousel_interval_ms integer,
  carousel_transition text,
  static_media_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_zones IS 'Page-level configuration for dynamic content zones (backgrounds, featured content, etc.)';
COMMENT ON COLUMN public.site_zones.key IS 'Unique zone identifier (e.g., "home.background", "page.about.background")';
COMMENT ON COLUMN public.site_zones.config_json IS 'JSON configuration describing source pools, weights, etc.';
COMMENT ON COLUMN public.site_zones.randomization_enabled IS 'When false, lock the zone to static media and skip random rotation';

-- ----------------------------------------------------------------------------
-- Auto-updated timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_zones_updated ON public.site_zones;
CREATE TRIGGER trg_site_zones_updated
  BEFORE UPDATE ON public.site_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- RLS policies
-- ----------------------------------------------------------------------------
ALTER TABLE public.site_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site zones" ON public.site_zones;
CREATE POLICY "Anyone can view site zones"
  ON public.site_zones
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage zones" ON public.site_zones;
CREATE POLICY "Authenticated users can manage zones"
  ON public.site_zones
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Seed defaults (idempotent)
-- ----------------------------------------------------------------------------
INSERT INTO public.site_zones (key, config_json)
SELECT zone.key, zone.config_json
FROM (
  VALUES
    ('home.background',     '{"mode":"random","slideshow":true,"intervalMs":6000,"folders":["media"],"images":[]}'::jsonb),
    ('page.about.background',    '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('page.gallery.background',  '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('page.essays.background',   '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('page.shop.background',     '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('page.contact.background',  '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('fallback.background', '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb)
) AS zone(key, config_json)
WHERE NOT EXISTS (SELECT 1 FROM public.site_zones existing WHERE existing.key = zone.key);

-- Ensure new columns exist in legacy rows
UPDATE public.site_zones
SET randomization_enabled = COALESCE(randomization_enabled, true),
    carousel_enabled = COALESCE(carousel_enabled, false);

-- ----------------------------------------------------------------------------
-- Recent backgrounds helper function (fix DISTINCT/ORDER BY)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_recent_backgrounds(p_page_key text, p_limit integer DEFAULT 5)
RETURNS TABLE (media_id uuid) AS $$
BEGIN
  RETURN QUERY
    SELECT sub.media_id
    FROM (
      SELECT pbh.media_id, MAX(pbh.shown_at) AS last_shown
      FROM page_background_history pbh
      WHERE pbh.page_key = p_page_key
      GROUP BY pbh.media_id
      ORDER BY last_shown DESC
      LIMIT p_limit
    ) sub;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- PostgREST schema cache helper + immediate refresh
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reload_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

GRANT EXECUTE ON FUNCTION public.reload_schema_cache() TO anon, authenticated;

SELECT public.reload_schema_cache();
-- ============================================================================
