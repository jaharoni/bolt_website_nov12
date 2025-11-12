-- Essays table
CREATE TABLE IF NOT EXISTS public.essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  excerpt TEXT,
  body_md TEXT,
  cover_image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS essays_slug_idx ON public.essays(slug);
CREATE INDEX IF NOT EXISTS essays_status_idx ON public.essays(status);

-- Essays media (ordered attachments)
CREATE TABLE IF NOT EXISTS public.essays_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id UUID NOT NULL REFERENCES public.essays(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS essays_media_essay_idx ON public.essays_media(essay_id);

-- Galleries table
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS galleries_slug_idx ON public.galleries(slug);

-- Gallery items (ordered media)
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_items_gallery_idx ON public.gallery_items(gallery_id);

-- Media metadata (for post-upload management)
CREATE TABLE IF NOT EXISTS public.media_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  folder_path TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  mime_type TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS media_metadata_path_idx ON public.media_metadata(file_path);
CREATE INDEX IF NOT EXISTS media_metadata_folder_idx ON public.media_metadata(folder_path);
CREATE INDEX IF NOT EXISTS media_metadata_tags_idx ON public.media_metadata USING GIN(tags);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS essays_updated_at ON public.essays;
CREATE TRIGGER essays_updated_at BEFORE UPDATE ON public.essays
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS galleries_updated_at ON public.galleries;
CREATE TRIGGER galleries_updated_at BEFORE UPDATE ON public.galleries
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS media_metadata_updated_at ON public.media_metadata;
CREATE TRIGGER media_metadata_updated_at BEFORE UPDATE ON public.media_metadata
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_metadata ENABLE ROW LEVEL SECURITY;

-- Example policies (allow public read on published content)
CREATE POLICY "Allow public read on published essays" ON public.essays
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow all for service role" ON public.essays
  FOR ALL USING (true);

CREATE POLICY "Allow public read on visible galleries" ON public.galleries
  FOR SELECT USING (visible = true);

CREATE POLICY "Allow all for service role on galleries" ON public.galleries
  FOR ALL USING (true);

CREATE POLICY "Allow public read on gallery items" ON public.gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Allow all for service role on gallery items" ON public.gallery_items
  FOR ALL USING (true);

CREATE POLICY "Allow public read on media metadata" ON public.media_metadata
  FOR SELECT USING (true);

CREATE POLICY "Allow all for service role on media metadata" ON public.media_metadata
  FOR ALL USING (true);
