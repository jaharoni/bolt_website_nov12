-- Create search_mappings table
CREATE TABLE IF NOT EXISTS search_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  target_route TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE search_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON search_mappings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write access" ON search_mappings
  FOR ALL USING (auth.role() = 'authenticated'); -- Adjust based on actual admin role implementation

-- Seed initial data
INSERT INTO search_mappings (keyword, target_route) VALUES
  ('quote', '/contact'),
  ('hire', '/contact'),
  ('shoot', '/contact'),
  ('shop', '/merch'),
  ('buy', '/merch'),
  ('merch', '/merch'),
  ('print', '/merch'),
  ('event', '/events')
ON CONFLICT (keyword) DO NOTHING;
