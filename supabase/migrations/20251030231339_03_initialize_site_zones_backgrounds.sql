/*
  # Initialize Site Zones with Background Configurations

  1. Default Zone Configurations
    - home.background - Home page background
    - page.gallery.background - Gallery page background
    - page.about.background - About page background
    - page.contact.background - Contact page background
    - page.shop.background - Shop page background
    - page.essays.background - Essays page background
    - global.background - Global fallback

  2. Configuration
    - All zones configured to use "Backgrounds" folder
    - Random display mode
*/

-- Get the Backgrounds folder ID
DO $$
DECLARE
  backgrounds_folder_id uuid;
BEGIN
  SELECT id INTO backgrounds_folder_id FROM media_folders WHERE name = 'Backgrounds' LIMIT 1;
  
  IF backgrounds_folder_id IS NOT NULL THEN
    -- Insert default zone configurations
    INSERT INTO site_zones (key, config_json) VALUES
      ('home.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      )),
      ('page.gallery.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      )),
      ('page.about.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      )),
      ('page.contact.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      )),
      ('page.shop.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      )),
      ('page.essays.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      )),
      ('global.background', jsonb_build_object(
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id),
        'display', jsonb_build_object('mode', 'random', 'interval', 5000)
      ))
    ON CONFLICT (key) DO UPDATE SET
      config_json = EXCLUDED.config_json,
      updated_at = now();
  END IF;
END $$;
