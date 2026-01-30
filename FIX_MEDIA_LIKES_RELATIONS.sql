-- DEFINITIVE FIX FOR MEDIA LIKES AND COUNTS
-- THIS RESOLVES THE 404 ERRORS IN THE CONSOLE BY ENSURING THE LIKES INFRASTRUCTURE EXISTS

-- 1. ADD LIKE_COUNT TO MEDIA_FILES IF IT DOESN'T EXIST
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media_files' AND column_name='like_count') THEN
        ALTER TABLE public.media_files ADD COLUMN like_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. CREATE MEDIA_LIKES TABLE (THE MISSING RELATION)
CREATE TABLE IF NOT EXISTS public.media_likes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id uuid REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(file_id, user_id)
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES FOR SECURE ACCESS
DROP POLICY IF EXISTS "Likes_Select" ON public.media_likes;
CREATE POLICY "Likes_Select" ON public.media_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Likes_Insert" ON public.media_likes;
CREATE POLICY "Likes_Insert" ON public.media_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Likes_Delete" ON public.media_likes;
CREATE POLICY "Likes_Delete" ON public.media_likes FOR DELETE USING (auth.uid() = user_id);

-- 5. TRIGGER FUNCTION TO SYNC SOCIAL COUNTS
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

-- 6. ATTACH THE SOCIAL ENGINE TRIGGER
DROP TRIGGER IF EXISTS on_media_like ON public.media_likes;
CREATE TRIGGER on_media_like
    AFTER INSERT OR DELETE ON public.media_likes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_media_like();
