-- FUNCTION: Join Event
-- Allows a user to join an event if they provide the correct code and passkey
create or replace function public.join_event(
  input_code text,
  input_passkey text
)
returns json
language plpgsql
security definer
as $$
declare
  target_event_id uuid;
  v_is_public boolean;
  v_passkey text;
begin
  -- Find event by code
  select id, is_public, passkey into target_event_id, v_is_public, v_passkey
  from public.events
  where event_code = input_code;

  if target_event_id is null then
    return json_build_object('success', false, 'message', 'Invalid event code');
  end if;

  -- Verify passkey if private
  if not v_is_public and (v_passkey is distinct from input_passkey) and (v_passkey is not null) then
     return json_build_object('success', false, 'message', 'Invalid passkey');
  end if;

  -- Add to members
  insert into public.event_members (event_id, user_id, role)
  values (target_event_id, auth.uid(), 'member')
  on conflict (event_id, user_id) do nothing;

  return json_build_object('success', true, 'event_id', target_event_id);
end;
$$;

-- STORAGE: Create Bucket 'media'
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- STORAGE POLICIES
-- Allow access to media based on RLS (using helper function likely better, but we'll try direct joins)
-- Complex joins in storage policies can be slow or restricted. 
-- Best practice: Use a separate RLS table or simple checks.
-- Here we rely on the fact that if a user can Read the 'media_files' row, they should be able to read the file.
-- But Storage Policies are separate.

create policy "Give users access to own folder 1hk0j6_0" on storage.objects for select using (
  bucket_id = 'media'
  and (
    -- Public events or member
    exists (
      select 1 from public.events e
      left join public.event_members em on em.event_id = e.id
      where 
        e.id::text = (storage.foldername(name))[1] -- Assuming structure: event_id/filename
        and (e.is_public or e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  )
);

create policy "Give users access to own folder 1hk0j6_1" on storage.objects for insert with check (
   bucket_id = 'media'
   and (
      exists (
        select 1 from public.events e
        left join public.event_members em on em.event_id = e.id
        where 
          e.id::text = (storage.foldername(name))[1]
          and (e.owner_id = auth.uid() or em.user_id = auth.uid())
      )
   )
);

create policy "Give users access to own folder 1hk0j6_2" on storage.objects for delete using (
   bucket_id = 'media'
   and (
      exists (
        select 1 from public.events e
        where 
          e.id::text = (storage.foldername(name))[1]
          and e.owner_id = auth.uid()
      )
   )
);
