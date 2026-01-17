-- COMPREHENSIVE AUTH FIX (Fixes ALL Users & Future Signups)

-- 1. Enable pgcrypto (Required for password hashing)
create extension if not exists pgcrypto;

-- 2. Confirm ALL existing unconfirmed users (Fixes the 2 NULL users)
UPDATE auth.users
SET email_confirmed_at = now(),
    raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
WHERE email_confirmed_at IS NULL;

-- 3. Re-install the Auto-Confirm Trigger (Guarantees future users are fixed instantly)
CREATE OR REPLACE FUNCTION public.auto_confirm_created_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now(),
      raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_created_user();

-- 4. (OPTIONAL) Reset Password for a SPECIFIC user if you are locked out.
-- Only run this line if you want to reset 'gingercatmonster19@gmail.com' to 'password123' again.
update auth.users
set encrypted_password = crypt('password123', gen_salt('bf'))
where email = 'gingercatmonster19@gmail.com';
