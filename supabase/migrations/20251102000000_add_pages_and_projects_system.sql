/*
  # Add Pages and Gallery Projects System

  1. New Tables
    - `pages` - Custom page creation system
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `page_type` (text) - standard, portfolio, landing, about, contact, custom
      - `template` (text) - template identifier for rendering
      - `hero_media_id` (uuid, references media_items)
      - `content_json` (jsonb) - flexible content structure
      - `meta_title` (text)
      - `meta_description` (text)
      - `is_published` (boolean)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `page_media` - Junction table for page media relationships
      - `id` (uuid, primary key)
      - `page_id` (uuid, references pages)
      - `media_id` (uuid, references media_items)
      - `media_role` (text) - hero, gallery, thumbnail, inline
      - `position` (integer)

    - `gallery_projects` - Portfolio projects system
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `category` (text)
      - `description` (text)
      - `thumbnail_media_id` (uuid, references media_items)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `project_media` - Junction table for gallery project media
      - `id` (uuid, primary key)
      - `project_id` (uuid, references gallery_projects)
      - `media_id` (uuid, references media_items)
      - `position` (integer)

    - `product_media` - Junction table replacing images array in products
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `media_id` (uuid, references media_items)
      - `position` (integer)
      - `is_primary` (boolean)

  2. Security
    - Enable RLS on all new tables
    - Public can read published pages and active projects
    - Authenticated users can manage all content

  3. Indexes
    - Add indexes for performance on slugs and foreign keys
*/

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  page_type text NOT NULL DEFAULT 'standard' CHECK (page_type IN ('standard', 'portfolio', 'landing', 'about', 'contact', 'custom')),
  template text DEFAULT 'default',
  hero_media_id uuid REFERENCES media_items(id) ON DELETE SET NULL,
  content_json jsonb DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_pages_type ON pages(page_type);

-- Create page_media junction table
CREATE TABLE IF NOT EXISTS page_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  media_role text NOT NULL DEFAULT 'inline' CHECK (media_role IN ('hero', 'gallery', 'thumbnail', 'inline')),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_media_page ON page_media(page_id);
CREATE INDEX IF NOT EXISTS idx_page_media_media ON page_media(media_id);
CREATE INDEX IF NOT EXISTS idx_page_media_position ON page_media(page_id, position);

-- Create gallery_projects table
CREATE TABLE IF NOT EXISTS gallery_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'general',
  description text,
  thumbnail_media_id uuid REFERENCES media_items(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_projects_slug ON gallery_projects(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_category ON gallery_projects(category);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_active ON gallery_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_sort ON gallery_projects(sort_order);

-- Create project_media junction table
CREATE TABLE IF NOT EXISTS project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES gallery_projects(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_media ON project_media(media_id);
CREATE INDEX IF NOT EXISTS idx_project_media_position ON project_media(project_id, position);

-- Create product_media junction table
CREATE TABLE IF NOT EXISTS product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_media ON product_media(media_id);
CREATE INDEX IF NOT EXISTS idx_product_media_position ON product_media(product_id, position);

-- Enable RLS on all new tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
CREATE POLICY "Anyone can view published pages"
  ON pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for page_media
CREATE POLICY "Anyone can view page media for published pages"
  ON page_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_media.page_id
      AND pages.is_published = true
    )
  );

CREATE POLICY "Authenticated users can manage page media"
  ON page_media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for gallery_projects
CREATE POLICY "Anyone can view active gallery projects"
  ON gallery_projects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage gallery projects"
  ON gallery_projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for project_media
CREATE POLICY "Anyone can view project media for active projects"
  ON project_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_projects
      WHERE gallery_projects.id = project_media.project_id
      AND gallery_projects.is_active = true
    )
  );

CREATE POLICY "Authenticated users can manage project media"
  ON project_media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for product_media
CREATE POLICY "Anyone can view product media for active products"
  ON product_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_media.product_id
      AND products.is_active = true
    )
  );

CREATE POLICY "Authenticated users can manage product media"
  ON product_media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update timestamps trigger for pages
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update timestamps trigger for gallery_projects
CREATE TRIGGER gallery_projects_updated_at
  BEFORE UPDATE ON gallery_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
