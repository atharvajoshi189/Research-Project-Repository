-- FIX SCRIPT: Run this to ensure Projects are visible to everyone (fixing Dashboard empty state).

-- 1. Enable RLS on Projects (good practice)
alter table projects enable row level security;


-- 2. Drop potential restrictive policies to Reset
drop policy if exists "Projects are viewable by everyone" on projects;
drop policy if exists "Public projects are viewable by everyone." on projects;
drop policy if exists "Users can insert own project" on projects;
drop policy if exists "Users can update own project" on projects;
-- Drop policies from other script versions causing recursion
drop policy if exists "Public view accepted projects" on projects;
drop policy if exists "Collaborators view their projects" on projects;

-- 3. Create Permissive Policies

-- READ: Everyone (including anon if needed, or just authenticated) can view ALL projects
-- This ensures that when we join 'project_collaborators', the project data is not null.
create policy "Projects are viewable by everyone"
  on projects for select
  using ( true );


-- INSERT: Authenticated users can create projects
drop policy if exists "Authenticated users can insert projects" on projects;
create policy "Authenticated users can insert projects"
  on projects for insert
  with check ( auth.role() = 'authenticated' );

-- UPDATE: Project Leader (owner) can update
-- (Assuming 'student_id' column on projects table is the owner)
drop policy if exists "Owners can update own project" on projects;
create policy "Owners can update own project"
  on projects for update
  using ( auth.uid() = student_id );

-- 4. Ensure 'project_collaborators' Policies are also correct
alter table project_collaborators enable row level security;
drop policy if exists "Collaborators viewable by everyone" on project_collaborators;
create policy "Collaborators viewable by everyone"
  on project_collaborators for select
  using ( true );

drop policy if exists "Authenticated users can insert collaborators" on project_collaborators;
create policy "Authenticated users can insert collaborators"
  on project_collaborators for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Users can delete own collaboration" on project_collaborators;
create policy "Users can delete own collaboration"
  on project_collaborators for delete
  using ( auth.uid() = student_id ); 
  -- Note: existing code uses student_id for the user in this table.
