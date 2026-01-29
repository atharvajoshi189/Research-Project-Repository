-- Fix Profile Visibility for Search
-- The previous policy restricted users to only see their OWN profile.
-- We need to allow authenticated users to see ALL profiles to search for teammates and guides.

-- 1. Drop the restrictive policy
drop policy if exists "Users can view own profile" on profiles;

-- 2. Create a permissive policy for SELECT
-- "true" means anyone who is logged in (authenticated) can view any row.
create policy "Profiles are viewable by everyone"
on profiles for select
to authenticated
using ( true );

-- 3. Ensure other policies (update/insert) remain restrictive (already defined in fix_profile_rls.sql)
-- (No changes needed for insert/update, they usually only allow own profile)
