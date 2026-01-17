-- FORCE ENABLE RPC FUNCTION
-- This script drops and recreates the lookup function with permissive settings.

DROP FUNCTION IF EXISTS public.get_event_by_code(text);

CREATE OR REPLACE FUNCTION public.get_event_by_code(_code text)
RETURNS TABLE (
  id uuid,
  name text,
  is_public boolean,
  owner_id uuid,
  event_code text
)
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
SET search_path = public -- Secure search path
AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.name, e.is_public, e.owner_id, e.event_code
  FROM public.events e
  WHERE e.event_code = _code
  LIMIT 1;
END;
$$;

-- Grant access to everyone (Anonymous and Logged In)
GRANT EXECUTE ON FUNCTION public.get_event_by_code(text) TO anon, authenticated, service_role;
