-- EMERGENCY INFRASTRUCTURE REPAIR: SOCIAL & MODERATION LAYER
-- This script fixes the "Likes not appearing" and "Deletion failing" issues.

-- 1. FIX STORAGE DELETION (Critical: Allows Event Owners to moderate their vault)
-- The folder structure is bucket/event_id/filename
DROP POLICY IF EXISTS "User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'media' AND (
    auth.uid() = owner OR
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE (storage.foldername(name))[1] = id::text 
      AND owner_id = auth.uid()
    )
  )
);

-- 2. FIX DATABASE DELETION POLICIES
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can delete media" ON public.media_files;
CREATE POLICY "Owners can delete media" 
ON public.media_files 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND (owner_id = auth.uid())
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
    WHERE id = event_id AND (owner_id = auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM public.event_members 
    WHERE event_id = event_id AND user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- 3. FIX LIKES VISIBILITY (Ensure they show for guests)
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes_Select" ON public.media_likes;
CREATE POLICY "Likes_Select" ON public.media_likes FOR SELECT TO public USING (true);

-- 4. RE-ESTABLISH LIKE COUNT CACHE ENGINE
-- In case the columns or triggers are missing or broken
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media_files' AND column_name='like_count') THEN
        ALTER TABLE public.media_files ADD COLUMN like_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Recalculate counts to fix any drift
UPDATE public.media_files mf
SET like_count = (SELECT count(*) FROM public.media_likes WHERE file_id = mf.id);

-- Ensure trigger is active
CREATE OR REPLACE FUNCTION public.handle_media_like()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.media_files SET like_count = like_count + 1 WHERE id = NEW.file_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.media_files SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.file_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_media_like ON public.media_likes;
CREATE TRIGGER on_media_like
    AFTER INSERT OR DELETE ON public.media_likes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_media_like();

-- 5. ENABLE PUBLIC SELECT ON LIKES (Final verification)
COMMENT ON TABLE public.media_likes IS 'Stores user interactions with media assets.';
