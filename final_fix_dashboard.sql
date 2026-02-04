-- FINAL FIX: Run this to Un-hide your projects on the Dashboard.

-- 1. Unconditionally enable reading of Projects for everyone
-- This fixes the "You have no active projects" issue ensuring data is fetched.
alter table projects enable row level security;
drop policy if exists "Projects are viewable by everyone" on projects;
create policy "Projects are viewable by everyone" on projects for select using ( true );

-- 2. Unconditionally enable reading of Collaborators
alter table project_collaborators enable row level security;
drop policy if exists "Collaborators viewable by everyone" on project_collaborators;
create policy "Collaborators viewable by everyone" on project_collaborators for select using ( true );

-- 3. Ensure proper update/delete permissions for Owners
drop policy if exists "Owners can update own project" on projects;
create policy "Owners can update own project" on projects for update using ( auth.uid() = student_id );

drop policy if exists "Users can delete own collaboration" on project_collaborators;
create policy "Users can delete own collaboration" on project_collaborators for delete using ( auth.uid() = student_id );
