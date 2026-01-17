-- FIX STORAGE AND DATABASE PERMISSIONS (INTEGRATED)
-- This script fixes both the Database Table permissions AND the File Storage permissions.

-- PART 1: Enable Storage Policies (Critical for file uploads)
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Drop existing storage policies to avoid conflicts
drop policy if exists "Give users access to own folder 1u53s8_0" on storage.objects;
drop policy if exists "Give users access to own folder 1u53s8_1" on storage.objects;
drop policy if exists "Give users access to own folder 1u53s8_2" on storage.objects;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Owner Delete" on storage.objects;

-- Create Simplified, Robust Storage Policies
-- 1. Anyone can view (since bucket is public, but being explicit helps)
create policy "Public View" on storage.objects for select using ( bucket_id = 'media' );

-- 2. Any Authenticated user can upload (We rely on the DB table to enforce event logic)
-- This prevents the "Storage" layer from blocking valid uploads.
create policy "Authenticated Upload" on storage.objects for insert 
with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- 3. Users can delete their own files
create policy "User Delete" on storage.objects for delete 
using ( bucket_id = 'media' and auth.uid() = owner );


-- PART 2: Fix Database 'media_files' Policy
-- The previous policy might have been too complex (recursive). We simplify it here.

drop policy if exists "Media_Insert" on public.media_files;

create policy "Media_Insert" on public.media_files for insert 
with check (
  -- SIMPLIFIED CHECK:
  -- 1. User must be authenticated
  auth.role() = 'authenticated'
  AND (
      -- 2. Logic: You can upload if you are the Owner OR the Event is Open for Uploads
      -- We trust the frontend to send the correct 'event_id'.
      -- Use a direct subquery which is often more reliable than function calls in RLS
      exists (
        select 1 from public.events 
        where id = media_files.event_id 
        and (
           owner_id = auth.uid()          -- You are the owner
           or allow_uploads = true        -- Or uploads are allowed for everyone
        )
      )
  )
);

-- PART 3: Ensure Owner is treated as Member (Optional but good for consistency)
-- Trigger to auto-add creator as member
create or replace function public.auto_add_owner_as_member()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.event_members (event_id, user_id, role)
  values (new.id, new.owner_id, 'admin');
  return new;
end;
$$;

drop trigger if exists on_event_created_add_owner on public.events;
create trigger on_event_created_add_owner
after insert on public.events
for each row execute procedure public.auto_add_owner_as_member();
