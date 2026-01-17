-- FINAL CONSOLIDATED DATABASE FIX (v2)
-- Includes missing column creation to prevent "column not found" errors

-- 1. Ensure the column exists
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS allow_uploads BOOLEAN DEFAULT FALSE;

-- 2. Create the ownership check function (Security Critical)
create or replace function public.is_event_owner(_event_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.events 
    where id = _event_id 
    and owner_id = auth.uid()
  );
$$;

-- 3. Drop ALL related policies to ensure a clean slate
drop policy if exists "Events are viewable by public or members" on public.events;
drop policy if exists "Users can create events" on public.events;
drop policy if exists "Owners can update events" on public.events;
drop policy if exists "Owners can delete events" on public.events;
drop policy if exists "Events_Select" on public.events;
drop policy if exists "Events_Insert" on public.events;
drop policy if exists "Events_Update" on public.events;
drop policy if exists "Events_Delete" on public.events;

drop policy if exists "Members viewable by event members" on public.event_members;
drop policy if exists "Users can join public events" on public.event_members;
drop policy if exists "Members_Select" on public.event_members;
drop policy if exists "Members_Insert" on public.event_members;
drop policy if exists "Members_Delete" on public.event_members;

-- 4. Re-create EVENTS policies
create policy "Events_Select" on public.events for select
using (
  is_public = true 
  or owner_id = auth.uid() 
  or id in (select event_id from public.event_members where user_id = auth.uid())
);

create policy "Events_Insert" on public.events for insert with check (auth.uid() = owner_id);
create policy "Events_Update" on public.events for update using (auth.uid() = owner_id);
create policy "Events_Delete" on public.events for delete using (auth.uid() = owner_id);

-- 5. Re-create MEMBERS policies
create policy "Members_Select" on public.event_members for select
using (
  user_id = auth.uid() 
  or public.is_event_owner(event_id)
);

create policy "Members_Insert" on public.event_members for insert with check (user_id = auth.uid());

create policy "Members_Delete" on public.event_members for delete using (
  user_id = auth.uid() 
  or public.is_event_owner(event_id)
);

-- 6. Re-create MEDIA policies
drop policy if exists "Media_Select" on public.media_files;
drop policy if exists "Media_Insert" on public.media_files;
drop policy if exists "Media_Delete" on public.media_files;
drop policy if exists "Users can upload media" on public.media_files;
drop policy if exists "Users can view media" on public.media_files;
drop policy if exists "Owners can delete media" on public.media_files;

create policy "Media_Select" on public.media_files for select
using (
  (select is_public from public.events where id = event_id) = true
  or public.is_event_owner(event_id)
  or exists (select 1 from public.event_members where event_id = media_files.event_id and user_id = auth.uid())
);

create policy "Media_Insert" on public.media_files for insert with check (
   -- Owner can always upload
   public.is_event_owner(event_id)
   OR
   -- Others can upload IF event allows it AND (they are a member OR event is public)
   (
     (SELECT allow_uploads FROM public.events WHERE id = event_id) = TRUE
     AND
     (
       (SELECT is_public FROM public.events WHERE id = event_id) = TRUE
       OR
       EXISTS (SELECT 1 FROM public.event_members WHERE event_id = media_files.event_id AND user_id = auth.uid())
     )
   )
);

create policy "Media_Delete" on public.media_files for delete using (
  auth.uid() = uploader_id 
  or public.is_event_owner(event_id)
);
