-- FORCE RESET PASSWORD & CONFIRMATION
-- Replace 'YOUR_EMAIL_HERE' with your actual email address before running.

-- 1. Enable pgcrypto if not available (Supabase usually has this)
create extension if not exists pgcrypto;

-- 2. Update the user (Confirm Email + Set Password to 'password123')
update auth.users
set 
  email_confirmed_at = now(),
  encrypted_password = crypt('password123', gen_salt('bf')),
  raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
where email = 'YOUR_EMAIL_HERE'; 

-- ^^^ IMPORTANT: Change 'YOUR_EMAIL_HERE' to your login email!
