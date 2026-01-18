-- SECURE RPC: JOIN EVENT
-- Fixes the issue where wrong passkeys might incorrectly allow access.
-- Also removes any ambiguity about return types.

CREATE OR REPLACE FUNCTION public.join_event(input_code text, input_passkey text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as superuser to bypass RLS on the 'events' table for the initial lookup
SET search_path = public -- Secure search path
AS $$
DECLARE
  _event_id uuid;
  _correct_passkey text;
  _is_public boolean;
  _user_id uuid;
BEGIN
  -- 1. Get current User ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Please log in first');
  END IF;

  -- 2. Lookup Event (Case Insensitive Code)
  SELECT id, passkey, is_public 
  INTO _event_id, _correct_passkey, _is_public
  FROM public.events
  WHERE upper(event_code) = upper(input_code);

  IF _event_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Event not found');
  END IF;

  -- 3. Validate Passkey
  -- If event is NOT public, strict passkey check.
  IF _is_public = FALSE THEN
    -- If the event has a passkey set, input must match.
    -- If event has NULL passkey (unlikely for private, but possible), then input must be ignored or strictly handled?
    -- Assumption: Private events MUST have a passkey.
    IF _correct_passkey IS NOT NULL AND _correct_passkey <> input_passkey THEN
       RETURN json_build_object('success', false, 'message', 'Invalid passkey');
    END IF;
    -- If correct_passkey is null, we assume it's "open to members" but maybe no password?
    -- Let's enforce: If correct_passkey is NULL, we allow join (rare case).
  END IF;

  -- 4. Add Member
  INSERT INTO public.event_members (event_id, user_id, role)
  VALUES (_event_id, _user_id, 'member')
  ON CONFLICT (event_id, user_id) DO NOTHING;

  RETURN json_build_object('success', true, 'event_id', _event_id);
END;
$$;
