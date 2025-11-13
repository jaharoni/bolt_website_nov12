-- Helper function to refresh PostgREST schema cache from client code
CREATE OR REPLACE FUNCTION public.reload_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

GRANT EXECUTE ON FUNCTION public.reload_schema_cache() TO anon, authenticated;
