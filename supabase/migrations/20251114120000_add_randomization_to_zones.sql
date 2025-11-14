/*
  # Add Randomization Support to Site Zones

  1. Changes
    - Add `randomization_enabled` column to `site_zones` table
      - Type: boolean
      - Default: false
      - Allows zones to randomly select backgrounds instead of sequential rotation

  2. Purpose
    - Enable per-zone control of background image selection strategy
    - Support both random and sequential background display modes
    - Maintain backward compatibility with existing zones (default to sequential)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_zones'
    AND column_name = 'randomization_enabled'
  ) THEN
    ALTER TABLE site_zones
    ADD COLUMN randomization_enabled boolean DEFAULT false NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN site_zones.randomization_enabled IS 'When true, backgrounds are randomly selected instead of using sequential rotation';
