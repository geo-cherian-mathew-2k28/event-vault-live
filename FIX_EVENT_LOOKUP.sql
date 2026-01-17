-- FIX: Ensure public access for querying events by code
-- 1. Create a function to lookup events by code securely (bypasses RLS for this specific purpose)
create or replace function public.get_event_by_code(_code text)
returns setof public.events
language sql
security definer
stable
as $$
  select * from public.events where event_code = _code limit 1;
$$;

-- 2. Grant caching permissions on the function (optional, good practice)
grant execute on function public.get_event_by_code(text) to public, authenticated, anon;
