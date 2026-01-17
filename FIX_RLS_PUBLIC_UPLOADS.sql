-- FIX: Ensure Public Uploads work for Anonymous Users (Guests)
-- This script specifically targets the "Allow Public Uploads" feature.

-- 1. Ensure anonymous users can INSERT into media_files
-- The previous policy might have implicitly required authentication if not carefully written.
-- We recreate the INSERT policy to be explicitly permissive for guests if the event allows it.

DROP POLICY IF EXISTS "Media_Insert" ON public.media_files;

CREATE POLICY "Media_Insert" ON public.media_files FOR INSERT WITH CHECK (
    -- Case 1: Owner (Always allowed)
    public.is_event_owner(event_id)
    OR
    -- Case 2: Public Uploads Allowed (Guest or Member)
    (
        -- Check if event specifically allows uploads
        (SELECT allow_uploads FROM public.events WHERE id = event_id) = TRUE
        AND
        (
             -- Event must be Public
             (SELECT is_public FROM public.events WHERE id = event_id) = TRUE
             OR
             -- OR User must be a member (Member of private event)
             (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.event_members WHERE event_id = media_files.event_id AND user_id = auth.uid()))
        )
    )
);

-- 2. Ensure Storage Bucket Policies allow Anon Uploads
-- Sometimes RLS on the table is fine, but Storage Bucket objects mismatch.
-- This part is tricky via SQL but we can ensure the table logic is sound.
-- (Storage policies are managed in the Storage UI usually, but we assume
-- standard "authenticated" or "public" bucket settings.
-- If the bucket is "public", anyone can read.
-- For uploads, we need a policy on `storage.objects`).

-- Note: We can't easily alter storage.objects policies from here without knowing the exact policy names used by Supabase Storage by default.
-- However, we can advise the user to check Storage settings if this fails.
-- But usually, RLS on the table is the main blocker for the *application logic*.

-- 3. Grant usage just in case
GRANT INSERT ON TABLE public.media_files TO anon;
GRANT SELECT ON TABLE public.media_files TO anon;
