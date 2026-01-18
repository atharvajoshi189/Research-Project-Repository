-- Enable RLS on profiles table
alter table profiles enable row level security;

-- Allow users to view their own profile
create policy "Users can view own profile"
on profiles for select
to authenticated
using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "Users can insert own profile"
on profiles for insert
to authenticated
with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
on profiles for update
to authenticated
using (auth.uid() = id);

-- Grant access to authenticated users
grant all on table profiles to authenticated;
