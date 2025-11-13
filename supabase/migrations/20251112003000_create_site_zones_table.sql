-- Ensure pgcrypto (needed for gen_random_uuid) is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create site_zones table if it does not exist
CREATE TABLE IF NOT EXISTS public.site_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  randomization_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_zones IS 'Page-level configuration for dynamic content zones (backgrounds, featured content, etc.)';
COMMENT ON COLUMN public.site_zones.key IS 'Unique zone identifier (e.g., "home.background", "page.about.background")';
COMMENT ON COLUMN public.site_zones.config_json IS 'JSON configuration for the zone (source, display options, etc.)';
COMMENT ON COLUMN public.site_zones.randomization_enabled IS 'When false, lock the zone to the static_media_id defined in config_json or related settings';

-- Auto-update updated_at column
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

-- Enable Row Level Security and default policies (match existing environment)
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

-- Seed default zones if table is empty
INSERT INTO public.site_zones (key, config_json)
SELECT z.key, z.config_json
FROM (
  VALUES
    ('home.background',            '{"mode":"random","slideshow":true,"intervalMs":6000,"folders":["media"],"images":[]}'::jsonb),
    ('about.background',           '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('gallery.background',         '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('essays.background',          '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('shop.background',            '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('contact.background',         '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb),
    ('fallback.background',        '{"mode":"random","slideshow":false,"folders":["media"],"images":[]}'::jsonb)
) AS z(key, config_json)
WHERE NOT EXISTS (SELECT 1 FROM public.site_zones existing WHERE existing.key = z.key);

-- Refresh PostgREST schema cache so the new column/table are recognized immediately
NOTIFY pgrst, 'reload schema';
