/*
  # Seed Background Images

  1. Purpose
    - Add professional photography background images from Pexels
    - These are placeholder images until you upload your own
    - All images are high-quality and suitable for a photography portfolio

  2. Images Added
    - 10 professional background images
    - Tagged with 'background' and 'homebg' for fallback
    - All images set to is_active=true
    - Organized in the Backgrounds folder
*/

DO $$
DECLARE
  backgrounds_folder_id uuid;
BEGIN
  -- Get the Backgrounds folder ID
  SELECT id INTO backgrounds_folder_id FROM media_folders WHERE name = 'Backgrounds' LIMIT 1;
  
  IF backgrounds_folder_id IS NOT NULL THEN
    -- Insert background images
    INSERT INTO media_items (title, alt_text, bucket_name, storage_path, public_url, media_type, is_active, folder_id, tags, page_context) VALUES
      (
        'Urban Architecture',
        'Modern urban architecture background',
        'backgrounds',
        'urban-architecture.jpg',
        'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'urban']::text[],
        'background'
      ),
      (
        'Golden Hour Portrait',
        'Golden hour natural light background',
        'backgrounds',
        'golden-hour.jpg',
        'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'portrait']::text[],
        'background'
      ),
      (
        'Minimalist Space',
        'Clean minimalist interior background',
        'backgrounds',
        'minimalist-space.jpg',
        'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'minimal']::text[],
        'background'
      ),
      (
        'Night Market',
        'Cultural night market atmosphere',
        'backgrounds',
        'night-market.jpg',
        'https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'street']::text[],
        'background'
      ),
      (
        'Modern Architecture',
        'Contemporary architectural photography',
        'backgrounds',
        'modern-architecture.jpg',
        'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'architecture']::text[],
        'background'
      ),
      (
        'Fashion Editorial',
        'Fashion photography background',
        'backgrounds',
        'fashion-editorial.jpg',
        'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'fashion']::text[],
        'background'
      ),
      (
        'Event Atmosphere',
        'Professional event photography background',
        'backgrounds',
        'event-atmosphere.jpg',
        'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'event']::text[],
        'background'
      ),
      (
        'Brand Campaign',
        'Commercial brand photography backdrop',
        'backgrounds',
        'brand-campaign.jpg',
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'commercial']::text[],
        'background'
      ),
      (
        'Art Gallery',
        'Contemporary art gallery setting',
        'backgrounds',
        'art-gallery.jpg',
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'gallery']::text[],
        'background'
      ),
      (
        'Culinary Arts',
        'Food and culinary photography background',
        'backgrounds',
        'culinary-arts.jpg',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'image',
        true,
        backgrounds_folder_id,
        ARRAY['background', 'homebg', 'food']::text[],
        'background'
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
