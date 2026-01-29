-- SUPPORT FOR NESTED FOLDERS
CREATE TABLE IF NOT EXISTS public.folders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    parent_id uuid REFERENCES public.folders(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- UPDATE MEDIA FILES TO SUPPORT FOLDERS
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media_files' AND column_name='folder_id') THEN
        ALTER TABLE public.media_files ADD COLUMN folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- RLS FOR FOLDERS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Folders_Select" ON public.folders;
CREATE POLICY "Folders_Select" ON public.folders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = folders.event_id 
    AND (
        e.is_public OR 
        e.owner_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.event_members em WHERE em.event_id = e.id AND em.user_id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Folders_Insert" ON public.folders;
CREATE POLICY "Folders_Insert" ON public.folders FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Folders_Update" ON public.folders;
CREATE POLICY "Folders_Update" ON public.folders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Folders_Delete" ON public.folders;
CREATE POLICY "Folders_Delete" ON public.folders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.owner_id = auth.uid()
  )
);
