-- FIX: Infinite Recursion in RLS Policies & Auth Triggers

-- 1. Create Secure Ownership Check Function (Bypasses RLS)
create or replace function public.is_event_owner(_event_id uuid)
returns boolean
language sql
security definer -- CRITICAL: Runs as superuser to bypass recursive RLS checks
stable
as $$
  select exists (
    select 1 from public.events 
    where id = _event_id 
    and owner_id = auth.uid()
  );
$$;

-- 2. Clean up old recursive policies
drop policy if exists "Events are viewable by public or members" on public.events;
drop policy if exists "Users can create events" on public.events;
drop policy if exists "Owners can update events" on public.events;
drop policy if exists "Owners can delete events" on public.events;

drop policy if exists "Members viewable by event members" on public.event_members;
drop policy if exists "Users can join public events" on public.event_members;

-- 3. New Optimized EVENTS Policies
create policy "Events_Select" on public.events for select
using (
  is_public = true 
  or owner_id = auth.uid() 
  or id in (select event_id from public.event_members where user_id = auth.uid())
);

create policy "Events_Insert" on public.events for insert with check (auth.uid() = owner_id);
create policy "Events_Update" on public.events for update using (auth.uid() = owner_id);
create policy "Events_Delete" on public.events for delete using (auth.uid() = owner_id);

-- 4. New Optimized MEMBERS Policies
-- We use the function `is_event_owner` to check if current user owns the event,
-- avoiding a direct select on `public.events` that would trigger the loop.
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

-- 5. Fix potential Profile trigger issues
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing; -- Prevent errors on duplicate
  return new;
end;
$$ language plpgsql security definer;
