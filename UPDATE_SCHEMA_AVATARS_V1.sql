-- SUPPORT FOR PROFILE IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICY FOR AVATARS
-- Clean up old policies if they exist to avoid conflicts on re-run
DROP POLICY IF EXISTS "Avatars are public" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;

CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- IMPROVE JOIN EVENT PERMISSIONS
-- We use DROP FUNCTION... CASCADE to ensure we can change signatures if needed
DROP FUNCTION IF EXISTS public.join_event(text, text) CASCADE;

CREATE OR REPLACE FUNCTION public.join_event(
  input_code text,
  input_passkey text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_event_id uuid;
  v_is_public boolean;
  v_passkey text;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
     RETURN json_build_object('success', false, 'message', 'Authentication required');
  END IF;

  -- Find event by code
  SELECT id, is_public, passkey INTO target_event_id, v_is_public, v_passkey
  FROM public.events
  WHERE LOWER(event_code) = LOWER(input_code);

  IF target_event_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid event code');
  END IF;

  -- Verify passkey if private
  IF NOT v_is_public AND (v_passkey IS DISTINCT FROM input_passkey) AND (v_passkey IS NOT NULL) THEN
     RETURN json_build_object('success', false, 'message', 'Invalid passkey');
  END IF;

  -- Add to members
  INSERT INTO public.event_members (event_id, user_id, role)
  VALUES (target_event_id, v_user_id, 'member')
  ON CONFLICT (event_id, user_id) DO NOTHING;

  RETURN json_build_object('success', true, 'event_id', target_event_id);
END;
$$;

-- HELPER FOR PUBLIC CODE RESOLUTION
-- Fix for return type change error
DROP FUNCTION IF EXISTS public.get_event_id_by_code(text) CASCADE;

CREATE OR REPLACE FUNCTION public.get_event_id_by_code(code_input text)
RETURNS SETOF public.events
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.events
  WHERE LOWER(event_code) = LOWER(code_input);
$$;
