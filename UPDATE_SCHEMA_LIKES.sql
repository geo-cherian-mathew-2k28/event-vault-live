-- SUPPORT FOR MEDIA LIKES
CREATE TABLE IF NOT EXISTS public.media_likes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id uuid REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(file_id, user_id)
);

-- RLS FOR LIKES
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes_Select" ON public.media_likes;
CREATE POLICY "Likes_Select" ON public.media_likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Likes_Insert" ON public.media_likes;
CREATE POLICY "Likes_Insert" ON public.media_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Likes_Delete" ON public.media_likes;
CREATE POLICY "Likes_Delete" ON public.media_likes FOR DELETE
USING (auth.uid() = user_id);
