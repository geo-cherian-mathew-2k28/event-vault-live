-- SUPPORT FOR DOWNLOAD PERMISSIONS
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS allow_downloads boolean DEFAULT true;

-- Update existing join_event to ensure it handles potential new schema if needed
-- (The previous join_event doesn't strictly need changes for downloads as it's a read property)
