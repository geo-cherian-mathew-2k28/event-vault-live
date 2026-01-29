-- FIX FOR MEDIA FILES UPDATE (MOVE/PASTE)
DROP POLICY IF EXISTS "Owners can update media" ON public.media_files;
CREATE POLICY "Owners can update media" ON public.media_files FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.owner_id = auth.uid()
  )
);
