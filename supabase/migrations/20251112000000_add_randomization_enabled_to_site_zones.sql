-- Add randomization_enabled flag to site_zones to control background rotation
ALTER TABLE public.site_zones
ADD COLUMN IF NOT EXISTS randomization_enabled boolean DEFAULT true NOT NULL;

-- Ensure existing rows get the default value
UPDATE public.site_zones
SET randomization_enabled = COALESCE(randomization_enabled, true);
