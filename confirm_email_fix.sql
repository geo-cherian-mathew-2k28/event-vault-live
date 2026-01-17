-- FIX: Manually Confirm All Users
-- Run this in Supabase SQL Editor to bypass email confirmation for your account.

-- 1. Confirm all existing users immediately
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. (Optional) Ensure the profile exists if the trigger failed previously
INSERT INTO public.profiles (id, email)
SELECT id, email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
