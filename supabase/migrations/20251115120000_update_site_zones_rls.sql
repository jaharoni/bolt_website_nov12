-- Fix site_zones RLS policies so the admin UI can write without auth context
-- Requirements:
--   1. Keep the existing SELECT policy ("Anyone can view site zones")
--   2. Allow INSERT, UPDATE, DELETE for all users (authenticated or not)

-- Remove the old authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can manage zones" ON public.site_zones;

-- Ensure we don't duplicate any write policies if this migration is reapplied
DROP POLICY IF EXISTS "Anyone can insert site zones" ON public.site_zones;
DROP POLICY IF EXISTS "Anyone can update site zones" ON public.site_zones;
DROP POLICY IF EXISTS "Anyone can delete site zones" ON public.site_zones;

-- Allow unauthenticated inserts coming from the admin UI
CREATE POLICY "Anyone can insert site zones"
  ON public.site_zones
  FOR INSERT
  WITH CHECK (true);

-- Allow unauthenticated updates
CREATE POLICY "Anyone can update site zones"
  ON public.site_zones
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow unauthenticated deletes
CREATE POLICY "Anyone can delete site zones"
  ON public.site_zones
  FOR DELETE
  USING (true);
