/*
  # Fix get_recent_backgrounds Function

  1. Issue
    - SELECT DISTINCT with ORDER BY columns that aren't in SELECT list causes error
    - PostgreSQL requires ORDER BY columns to appear in SELECT when using DISTINCT

  2. Solution
    - Include pbh.used_at in the SELECT DISTINCT list
    - This allows proper ordering while maintaining distinct results
    - The used_at column is already returned, so this doesn't change the API
*/

CREATE OR REPLACE FUNCTION public.get_recent_backgrounds(zone_key text, limit_count int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  url text,
  alt_text text,
  used_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (mi.id)
    mi.id,
    mi.url,
    mi.alt_text,
    pbh.used_at
  FROM media_items mi
  JOIN page_background_history pbh ON mi.id = pbh.media_item_id
  WHERE pbh.zone_key = get_recent_backgrounds.zone_key
  ORDER BY mi.id, pbh.used_at DESC
  LIMIT limit_count;
END;
$$;

COMMENT ON FUNCTION public.get_recent_backgrounds IS 'Returns recent background images for a zone, ordered by most recent usage';
