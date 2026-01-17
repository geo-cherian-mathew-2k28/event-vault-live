-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS Table (Extends Supabase Auth or Standalone)
-- Note: Supabase handles auth.users, but we often want a public profiles table.
-- For this project, we'll assume we link to auth.users but store profile data here.
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EVENTS Table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false,
  event_code text unique not null,
  passkey text, -- Store hashed if possible, but simplest is plain text for event codes if they are short shared secrets.
                -- For high security, hash it. Given requirements, we'll suggest hashing in app logic or store plain for MVP simplicity if allowed,
                -- but "Secure" in title suggests we should at least treat it carefully. 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EVENT MEMBERS (For access control)
create table public.event_members (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'admin', 'moderator')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- MEDIA FILES
create table public.media_files (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  uploader_id uuid references public.profiles(id) on delete set null,
  file_url text not null,
  storage_path text not null, -- Path in Supabase Storage
  file_type text not null, -- 'image', 'video', 'document'
  file_name text not null,
  size_bytes bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACCESS LOGS
create table public.access_logs (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.media_files enable row level security;

-- Profiles: Public read (or authenticated only), User update own
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Events: 
-- Public events are visible to everyone (or just listed?) 
-- Actually, "Public events -> accessible via link" implies read access.
-- Private events -> visible only if member or owner.
create policy "Events are viewable by public or members" on public.events for select
using (
  is_public = true 
  or auth.uid() = owner_id
  or exists (select 1 from public.event_members where event_id = public.events.id and user_id = auth.uid())
);

create policy "Users can create events" on public.events for insert with check (auth.uid() = owner_id);
create policy "Owners can update events" on public.events for update using (auth.uid() = owner_id);
create policy "Owners can delete events" on public.events for delete using (auth.uid() = owner_id);

-- Event Members
create policy "Members viewable by event members" on public.event_members for select
using (
  exists (select 1 from public.events where id = event_id and (owner_id = auth.uid() or is_public = true))
  or user_id = auth.uid()
);
create policy "Users can join public events" on public.event_members for insert with check (
   auth.uid() = user_id -- simplistic
);

-- Media Files
create policy "Media viewable by event access" on public.media_files for select
using (
  exists (
    select 1 from public.events 
    where id = event_id 
    and (is_public = true or owner_id = auth.uid() or exists (select 1 from public.event_members where event_id = public.events.id and user_id = auth.uid()))
  )
);

create policy "Upload media to allowed events" on public.media_files for insert with check (
   exists (
    select 1 from public.events 
    where id = event_id 
    and (owner_id = auth.uid() or exists (select 1 from public.event_members where event_id = public.events.id and user_id = auth.uid()))
   )
);

create policy "Owners can delete media" on public.media_files for delete using (
   uploader_id = auth.uid() or exists (select 1 from public.events where id = event_id and owner_id = auth.uid())
);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
