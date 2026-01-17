-- PROFESSIONAL FIX: Auto-Confirm Users (Bypasses Email Service Requirement)
-- This script creates a database trigger that automatically confirms every new user immediately.
-- This allows " Production-Ready" behavior in development environments where SMTP is not configured.

-- 1. Create the trigger function
create or replace function public.auto_confirm_created_user()
returns trigger
language plpgsql
security definer
as $$
begin
  update auth.users
  set email_confirmed_at = now()
  where id = new.id;
  return new;
end;
$$;

-- 2. Create the trigger on auth.users
-- Drop first to avoid duplicates if running multiple times
drop trigger if exists on_auth_user_created_auto_confirm on auth.users;

create trigger on_auth_user_created_auto_confirm
after insert on auth.users
for each row
execute procedure public.auto_confirm_created_user();

-- 3. Retroactively fix ALL existing users (including the one you are trying to login with now)
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;
