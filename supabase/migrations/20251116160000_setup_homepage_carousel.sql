/*
  # Setup Homepage Carousel Configuration

  1. Purpose
    - Ensure home.background zone exists in site_zones table
    - Configure homepage with carousel enabled by default
    - Set reasonable default interval for carousel rotation
    - Configure default media folder for backgrounds

  2. Changes
    - Upsert home.background zone with carousel_enabled = true
    - Set carousel_interval_ms = 7000 (7 seconds)
    - Set randomization_enabled = true
    - Configure to use 'backgrounds' folder by default

  3. Notes
    - This migration is idempotent and safe to run multiple times
    - Will not overwrite existing configuration if zone already exists
    - All other pages default to randomization without carousel
*/

-- Ensure home.background zone exists with carousel enabled
INSERT INTO site_zones (
  key,
  carousel_enabled,
  carousel_interval_ms,
  randomization_enabled,
  config_json,
  created_at,
  updated_at
)
VALUES (
  'home.background',
  true,
  7000,
  true,
  '{"folders": ["backgrounds"]}'::jsonb,
  now(),
  now()
)
ON CONFLICT (key) DO UPDATE SET
  updated_at = now()
WHERE site_zones.carousel_enabled IS NULL;

-- Ensure all other existing page zones have sensible defaults
UPDATE site_zones
SET
  carousel_enabled = COALESCE(carousel_enabled, false),
  carousel_interval_ms = COALESCE(carousel_interval_ms, 7000),
  randomization_enabled = COALESCE(randomization_enabled, true),
  config_json = COALESCE(config_json, '{"folders": ["backgrounds"]}'::jsonb),
  updated_at = now()
WHERE carousel_enabled IS NULL
   OR carousel_interval_ms IS NULL
   OR randomization_enabled IS NULL
   OR config_json IS NULL;

-- Add helpful comment
COMMENT ON TABLE site_zones IS 'Configuration for page-specific background settings including carousel and randomization';
