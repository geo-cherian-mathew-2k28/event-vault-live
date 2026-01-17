-- Add allow_uploads column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS allow_uploads BOOLEAN DEFAULT TRUE;

-- Update RLS policy for media_files INSERT to respect allow_uploads
DROP POLICY IF EXISTS "Users can upload media" ON public.media_files;

CREATE POLICY "Users can upload media" ON public.media_files
FOR INSERT WITH CHECK (
  -- User must be the owner OR (member AND uploads allowed)
  auth.uid() = (SELECT owner_id FROM public.events WHERE id = event_id)
  OR 
  (
    (SELECT allow_uploads FROM public.events WHERE id = event_id) = TRUE
    AND
    (
      EXISTS (SELECT 1 FROM public.event_members WHERE event_id = media_files.event_id AND user_id = auth.uid())
      OR
      (SELECT is_public FROM public.events WHERE id = event_id) = TRUE
    )
  )
);
