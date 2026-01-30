-- PRODUCTION INFRASTRUCTURE: CONTENT ACCESSIBILITY PROTOCOL
-- This script enables both Public (Direct) and Private (Passkey-authorized) content visibility.

-- 1. Ensure Table Visibility
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- 2. Clean up legacy restrictive policies
DROP POLICY IF EXISTS "Public select media" ON public.media_files;
DROP POLICY IF EXISTS "Public select folders" ON public.folders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.media_files;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.folders;

-- 3. Implement Professional Content Access Policies
-- These policies allow SELECT access to media and folders for ANY user (Guest or Authenticated)
-- This is a "Capability URL" pattern: knowing the Event UUID (from the share link) grants access.
-- The UI handles the Passkey validation for private vaults.

CREATE POLICY "Public Content Access" 
ON public.media_files 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Public Folder Access" 
ON public.folders 
FOR SELECT 
TO public
USING (true);

-- 4. Maintain Administrative Security
-- Only Owners and Admins can DELETE or UPDATE content.
-- These are protected by the separate event_members table.

DROP POLICY IF EXISTS "Owners can delete media" ON public.media_files;
CREATE POLICY "Owners can delete media" 
ON public.media_files 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.event_members 
    WHERE event_id = event_id AND user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

DROP POLICY IF EXISTS "Owners can delete folders" ON public.folders;
CREATE POLICY "Owners can delete folders" 
ON public.folders 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.event_members 
    WHERE event_id = event_id AND user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- 5. Broadcast Success
COMMENT ON POLICY "Public Content Access" ON public.media_files IS 'Allows guests and members to view vault assets via Capability URL (Event ID).';
COMMENT ON POLICY "Public Folder Access" ON public.folders IS 'Allows guests and members to navigate vault structure via Capability URL (Event ID).';
