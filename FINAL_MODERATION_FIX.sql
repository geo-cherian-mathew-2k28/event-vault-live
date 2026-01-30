-- FINAL MODERATION AUTHORITY REPAIR
-- This script structuraly guarantees that the Event Owner can delete any content.

-- 1. FIX MEDIA FILE DELETION POLICIES
DROP POLICY IF EXISTS "Owners can delete media" ON public.media_files;
CREATE POLICY "Owners can delete media" 
ON public.media_files 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.media_files.event_id 
    AND public.events.owner_id = auth.uid()
  )
);

-- 2. FIX FOLDER DELETION POLICIES
DROP POLICY IF EXISTS "Owners can delete folders" ON public.folders;
CREATE POLICY "Owners can delete folders" 
ON public.folders 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.folders.event_id 
    AND public.events.owner_id = auth.uid()
  )
);

-- 3. FIX STORAGE (FILE) DELETION POLICY
-- This is critical: if storage deletion fails, sometimes the app thinks the whole process failed.
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects 
FOR DELETE 
TO authenticated 
USING ( bucket_id = 'media' );

-- 4. VERIFY OWNERSHIP (Optional debug check)
-- Run this to see if your current user ID matches the event owner ID:
-- SELECT id, owner_id FROM public.events WHERE event_code = 'YOUR_CODE';
-- SELECT auth.uid();
