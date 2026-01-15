-- 1. Create Profiles Table (Publicly viewable user info)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- 2. Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Trigger to create profile on signup
-- This ensures that whenever a new user is created in auth.users, a row is created in public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error on multiple runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create Project Collaborators Table
create table if not exists public.project_collaborators (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('leader', 'contributor')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- 5. Enable RLS on Collaborators
alter table public.project_collaborators enable row level security;

create policy "Collaborators are viewable by everyone."
  on project_collaborators for select
  using ( true );

create policy "Authenticated users can add collaborators."
  on project_collaborators for insert
  with check ( auth.role() = 'authenticated' );

-- 6. Backfill existing users (Optional utility, helpful for dev)
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;
