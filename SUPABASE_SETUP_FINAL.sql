-- SUPABASE SETUP FINAL
-- Run this in the Supabase SQL Editor to configure your database correctly.

-- 1. Helper Function: Check Event Ownership (Bypasses RLS loop)
CREATE OR REPLACE FUNCTION public.is_event_owner(_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = _event_id 
    AND owner_id = auth.uid()
  );
$$;

-- 2. User Profile Trigger (Handles new user signups)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS Policies: EVENTS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events_Select" ON public.events;
DROP POLICY IF EXISTS "Events_Insert" ON public.events;
DROP POLICY IF EXISTS "Events_Update" ON public.events;
DROP POLICY IF EXISTS "Events_Delete" ON public.events;
-- Cleanup old policies just in case
DROP POLICY IF EXISTS "Events are viewable by public or members" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Owners can update events" ON public.events;
DROP POLICY IF EXISTS "Owners can delete events" ON public.events;

CREATE POLICY "Events_Select" ON public.events FOR SELECT
USING (
  is_public = true 
  OR owner_id = auth.uid() 
  OR id IN (SELECT event_id FROM public.event_members WHERE user_id = auth.uid())
);

CREATE POLICY "Events_Insert" ON public.events FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Events_Update" ON public.events FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Events_Delete" ON public.events FOR DELETE USING (auth.uid() = owner_id);

-- 4. RLS Policies: EVENT MEMBERS
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members_Select" ON public.event_members;
DROP POLICY IF EXISTS "Members_Insert" ON public.event_members;
DROP POLICY IF EXISTS "Members_Delete" ON public.event_members;
-- Cleanup old policies
DROP POLICY IF EXISTS "Members viewable by event members" ON public.event_members;
DROP POLICY IF EXISTS "Users can join public events" ON public.event_members;

CREATE POLICY "Members_Select" ON public.event_members FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.is_event_owner(event_id)
);

CREATE POLICY "Members_Insert" ON public.event_members FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members_Delete" ON public.event_members FOR DELETE USING (
  user_id = auth.uid() 
  OR public.is_event_owner(event_id)
);

-- 5. RLS Policies: MEDIA FILES & Public Uploads
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media_Insert" ON public.media_files;
DROP POLICY IF EXISTS "Media_Select" ON public.media_files;
-- Cleanup old
DROP POLICY IF EXISTS "Media viewable by event participants" ON public.media_files;
DROP POLICY IF EXISTS "Participants can upload media" ON public.media_files;

CREATE POLICY "Media_Select" ON public.media_files FOR SELECT
USING (
  public.is_event_owner(event_id)
  OR
  (
    (SELECT is_public FROM public.events WHERE id = event_id) = TRUE
    OR
    (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.event_members WHERE event_id = media_files.event_id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Media_Insert" ON public.media_files FOR INSERT WITH CHECK (
    -- Owner
    public.is_event_owner(event_id)
    OR
    -- Guests/Members if allowed
    (
        (SELECT allow_uploads FROM public.events WHERE id = event_id) = TRUE
        AND
        (
             (SELECT is_public FROM public.events WHERE id = event_id) = TRUE
             OR
             (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.event_members WHERE event_id = media_files.event_id AND user_id = auth.uid()))
        )
    )
);

-- 6. Permissions for Anonymous Users (Crucial for guest uploads)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT ON TABLE public.media_files TO anon;
-- Also grant on events to allow checking public status
GRANT SELECT ON TABLE public.events TO anon;  

