-- FIX SCRIPT: Run this in Supabase SQL Editor to fix "Loading Teachers" and Search issues.

-- 1. Ensure 'role' column exists in profiles
do $$
begin
  if not exists (select column_name from information_schema.columns where table_name='profiles' and column_name='role') then
    alter table profiles add column role text default 'student' check (role in ('student', 'teacher', 'hod', 'HOD'));
  end if;
end $$;

-- 2. RESET RLS Policies for Profiles (To delete any broken/restrictive policies)
-- (We use 'do' block to drop IF EXISTS to avoid errors if they don't exist)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Everyone can view profiles" on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

-- 3. Enable RLS
alter table profiles enable row level security;

-- 4. Create NEW Permissive Policies

-- ALLOW READ: Everyone (Anon + Authenticated) can view ALL profiles
-- This fixes the "Loading Teachers..." stuck issue.
create policy "Everyone can view profiles"
  on profiles for select
  using ( true );

-- ALLOW INSERT: Only if user ID matches (standard)
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- ALLOW UPDATE: Only if user ID matches (standard)
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
