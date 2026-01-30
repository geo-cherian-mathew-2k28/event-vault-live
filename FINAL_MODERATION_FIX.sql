-- FINAL MODERATION AUTHORITY REPAIR (V3)
-- This script structuraly guarantees that both the Owner and Admins have absolute power.

-- 1. MEDIA FILE AUTHORIZATION (Table Level)
DROP POLICY IF EXISTS "Owners can delete media" ON public.media_files;
CREATE POLICY "Owners can delete media" 
ON public.media_files 
FOR DELETE 
TO authenticated 
USING (
  -- Check if user is the absolute owner of the event
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.media_files.event_id 
    AND public.events.owner_id = auth.uid()
  ) 
  OR 
  -- Check if user is an authorized admin in the member table
  EXISTS (
    SELECT 1 FROM public.event_members 
    WHERE public.event_members.event_id = public.media_files.event_id 
    AND public.event_members.user_id = auth.uid() 
    AND public.event_members.role IN ('admin', 'owner')
  )
);

-- 2. FOLDER AUTHORIZATION (Table Level)
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
  OR
  EXISTS (
    SELECT 1 FROM public.event_members 
    WHERE public.event_members.event_id = public.folders.event_id 
    AND public.event_members.user_id = auth.uid() 
    AND public.event_members.role IN ('admin', 'owner')
  )
);

-- 3. STORAGE AUTHORIZATION (Bucket Level)
-- This allows admins to remove the actual underlying image files.
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects 
FOR DELETE 
TO authenticated 
USING ( bucket_id = 'media' );

-- 4. BROADCAST PERMISSIONS
-- Ensure everyone can see the assets (Capability URL pattern)
DROP POLICY IF EXISTS "Public Content Access" ON public.media_files;
CREATE POLICY "Public Content Access" ON public.media_files FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Folder Access" ON public.folders;
CREATE POLICY "Public Folder Access" ON public.folders FOR SELECT TO public USING (true);
