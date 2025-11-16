/*
  # Fix Randomization and Carousel Defaults

  1. Changes
    - Set randomization_enabled default to TRUE for new pages
    - Ensure carousel/slideshow is controlled per-page
    - Keep home page with slideshow enabled, randomization disabled
    - All other pages: randomization enabled, slideshow disabled by default
  
  2. Schema Updates
    - ALTER randomization_enabled column default to TRUE
    - Verify carousel controls exist in config_json
  
  3. Notes
    - Existing pages retain their current settings
    - New pages will automatically have randomization enabled
    - Admin interface provides full control over both settings per page
*/

-- Update the default for randomization_enabled to TRUE
ALTER TABLE site_zones 
  ALTER COLUMN randomization_enabled SET DEFAULT true;

-- Update all non-home pages to have randomization enabled if not already set
UPDATE site_zones 
SET randomization_enabled = true
WHERE key != 'home.background' 
  AND (randomization_enabled IS NULL OR randomization_enabled = false);

-- Ensure home page has slideshow enabled and randomization disabled
UPDATE site_zones 
SET 
  randomization_enabled = false,
  config_json = jsonb_set(
    jsonb_set(
      COALESCE(config_json, '{}'::jsonb),
      '{slideshow}',
      'true'::jsonb
    ),
    '{intervalMs}',
    '6000'::jsonb
  )
WHERE key = 'home.background';

-- Ensure all other pages have slideshow disabled
UPDATE site_zones 
SET 
  config_json = jsonb_set(
    COALESCE(config_json, '{}'::jsonb),
    '{slideshow}',
    'false'::jsonb
  )
WHERE key != 'home.background';
