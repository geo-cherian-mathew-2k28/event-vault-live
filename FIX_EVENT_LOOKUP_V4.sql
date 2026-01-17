-- FIX: Robust Event Lookup V4
-- This function is designed to be the definitive way to resolve event codes.
-- It bypasses RLS to ensure we can *always* find the event ID from the code,
-- treating the code as a "public key" to the event's location.

CREATE OR REPLACE FUNCTION public.get_event_id_by_code(code_input text)
RETURNS TABLE (
  id uuid,
  is_public boolean
)
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Run as superuser/owner to bypass RLS
SET search_path = public
AS $$
BEGIN
  -- Normalize input: Trim whitespace and handle potential nulls
  IF code_input IS NULL OR trim(code_input) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT e.id, e.is_public
  FROM public.events e
  -- Compare case-insensitive
  WHERE upper(e.event_code) = upper(trim(code_input));
END;
$$;

-- Grant access to everyone (Anonymous and Logged In)
GRANT EXECUTE ON FUNCTION public.get_event_id_by_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_event_id_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_id_by_code(text) TO service_role;
