/*
  # Seed Default Site Zones

  ## Purpose
  Creates default background zone configurations for all pages

  ## Zones Created
  - home.background - Homepage background configuration
  - about.background - About page background
  - gallery.background - Gallery page background
  - essays.background - Essays page background
  - shop.background - Shop page background
  - contact.background - Contact page background
  - fallback.background - Default fallback for unconfigured pages

  ## Security
  - All zones are publicly readable
  - Only authenticated users can modify
*/

-- Insert default zone configurations
INSERT INTO site_zones (key, config_json) VALUES
  ('home.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": true, "intervalMs": 6000}'::jsonb),
  ('about.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": false}'::jsonb),
  ('gallery.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": false}'::jsonb),
  ('essays.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": false}'::jsonb),
  ('shop.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": false}'::jsonb),
  ('contact.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": false}'::jsonb),
  ('fallback.background', '{"mode": "random", "images": [], "folders": ["media"], "slideshow": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Also create a "media" folder if it doesn't exist
INSERT INTO media_folders (name, parent_id)
VALUES ('media', NULL)
ON CONFLICT DO NOTHING;