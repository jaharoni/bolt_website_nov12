/*
  # Seed Existing Pages

  1. Purpose
    - Populate the pages table with existing website routes
    - Create entries for Home, About, Gallery, Essays, Shop, and Contact pages
    - All pages are marked as published since they're currently live

  2. Pages Created
    - Home (/, type: standard)
    - About (/about, type: about)
    - Gallery (/gallery, type: portfolio)
    - Essays (/essays, type: standard)
    - Shop (/shop, type: standard)
    - Contact (/contact, type: contact)
*/

-- Insert pages only if they don't already exist
INSERT INTO pages (title, slug, page_type, template, content_json, meta_title, meta_description, is_published, published_at)
VALUES
  (
    'Home',
    'home',
    'standard',
    'default',
    '{"html": "<h1>Welcome to Justin Aharoni Photography</h1><p>Turning moments into magic, one frame at a time.</p>"}',
    'Justin Aharoni - Visual Storyteller',
    'Professional photographer and filmmaker specializing in commercial photography, event coverage, and artistic visual storytelling.',
    true,
    now()
  ),
  (
    'About',
    'about',
    'about',
    'default',
    '{"html": "<h1>About Justin Aharoni</h1><p>Visual storyteller and professional photographer based in North Fork, Long Island.</p>"}',
    'About Justin Aharoni - Visual Storytelling Expert',
    'Professional photographer and filmmaker with expertise in commercial photography, live events, and digital media production. Based in New York, serving clients worldwide.',
    true,
    now()
  ),
  (
    'Gallery',
    'gallery',
    'portfolio',
    'default',
    '{"html": "<h1>Gallery</h1><p>Explore the portfolio of commercial work, events, and artistic projects.</p>"}',
    'Gallery - Justin Aharoni Photography',
    'Explore Justin Aharoni''s photography portfolio featuring commercial work, event coverage, brand photography, and personal artistic projects.',
    true,
    now()
  ),
  (
    'Essays',
    'essays',
    'standard',
    'default',
    '{"html": "<h1>Essays</h1><p>Deep dives into the human condition through visual storytelling.</p>"}',
    'Essays - Visual Storytelling',
    'Deep dives into the human condition through visual storytelling. Explore essays combining photography and narrative.',
    true,
    now()
  ),
  (
    'Shop',
    'shop',
    'standard',
    'default',
    '{"html": "<h1>Shop</h1><p>Browse and purchase fine art prints, limited editions, and merchandise.</p>"}',
    'Shop - Fine Art Prints & Merchandise',
    'Browse and purchase fine art prints, limited editions, and merchandise from photographer Justin Aharoni.',
    true,
    now()
  ),
  (
    'Contact',
    'contact',
    'contact',
    'default',
    '{"html": "<h1>Contact</h1><p>Get in touch for bookings, collaborations, or inquiries.</p>"}',
    'Contact Justin Aharoni',
    'Get in touch with Justin Aharoni for photography services, bookings, collaborations, and project inquiries.',
    true,
    now()
  )
ON CONFLICT (slug) DO NOTHING;
