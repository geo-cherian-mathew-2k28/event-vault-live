-- ROBUST EVENT LOOKUP (V3)
-- Fixes case sensitivity and whitespace issues.

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
SECURITY DEFINER -- Critical: Bypasses RLS
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.name, e.is_public, e.owner_id, e.event_code
  FROM public.events e
  WHERE upper(trim(e.event_code)) = upper(trim(_code)) -- Case insensitive and whitespace forgiving
  LIMIT 1;
END;
$$;

-- Grant access to everyone
GRANT EXECUTE ON FUNCTION public.get_event_by_code(text) TO anon, authenticated, service_role;

-- DEBUG: Check the code for the specific event ID you mentioned
-- (This will print the code in the results pane so you can verify it matches '2ORNQA')
SELECT id, event_code, name FROM public.events WHERE id = 'edc368ec-2498-47fb-af45-da603b5a320f';
