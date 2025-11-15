-- Update site_zones RLS policies to allow unauthenticated admin operations
-- 1. Keep the existing SELECT policy ("Anyone can view site zones")
-- 2. Allow INSERT, UPDATE, DELETE (FOR ALL) for all users by relaxing the manage policy

BEGIN;

DROP POLICY IF EXISTS "Authenticated users can manage zones" ON public.site_zones;
CREATE POLICY "Authenticated users can manage zones"
  ON public.site_zones
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;
