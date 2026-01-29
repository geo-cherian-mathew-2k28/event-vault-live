-- ENABLE REALTIME FOR PROFILES TABLE
-- This ensures that the Navbar can listen for avatar changes instantly
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
