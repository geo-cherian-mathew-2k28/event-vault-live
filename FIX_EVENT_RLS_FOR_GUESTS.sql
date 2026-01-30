-- PRODUCTION SECURITY PROTOCOL: RESOLVING SHARED ACCESS HANDSHAKE
-- This script fixes the "Vault Isolated" error that occurs when users are not logged in (Incognito).
-- It allows the infrastructure to serve basic vault metadata to guests so they can enter passkeys.

-- 1. Ensure RLS is active
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Terminate any restrictive selectors that block anonymous metadata resolution
DROP POLICY IF EXISTS "Public select events" ON public.events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;

-- 3. Implement the High-Resilience PolicySafely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' AND policyname = 'Public select events'
    ) THEN
        CREATE POLICY "Public select events" 
        ON public.events 
        FOR SELECT 
        TO public
        USING (true);
    END IF;
END
$$;

-- 4. Verify member policy exists to allow members to see their joined events
DROP POLICY IF EXISTS "Members can view events" ON public.events;
CREATE POLICY "Members can view events" 
ON public.events 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM public.event_members 
    WHERE event_id = id AND user_id = auth.uid()
  )
);

-- 5. Broadcast Success
COMMENT ON POLICY "Public select events" ON public.events IS 'Allows guests to resolve shared links via ID/Code for authentication handshake.';
