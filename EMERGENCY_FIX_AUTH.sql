-- ==============================================================================
-- 🚨 EMERGENCY FIX SCRIPT 🚨
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Copy ALL text in this file.
-- 2. Go to your Supabase Dashboard -> SQL Editor.
-- 3. Paste and Click RUN.
-- ==============================================================================

-- 1. CONFIRM ALL EMAILS (Fixes "Email not confirmed" error)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. CREATE AUTO-CONFIRM TRIGGER (Prevents future errors)
CREATE OR REPLACE FUNCTION public.auto_confirm_created_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_created_user();

-- 3. (OPTIONAL) RESET PASSWORD FOR ALL USERS TO "password123"
-- Uncomment the lines below if you forgot your password and want to reset ALL accounts.
-- UPDATE auth.users
-- SET encrypted_password = crypt('password123', gen_salt('bf'));
