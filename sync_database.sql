-- FINAL SYNC SCRIPT: Run this in your Supabase SQL Editor to ensure everything works perfectly.

-- 1. Ensure 'project_collaborators' uses 'student_id'
-- (Removing the rename to user_id as the codebase uses student_id)

-- 2. Update RLS policies to allow collaborators and immediate publishing
-- Projects Table
drop policy if exists "Public view accepted projects" on public.projects;
create policy "Public view accepted projects"
  on public.projects for select
  using ( status = 'approved' );

drop policy if exists "Owners can see their own projects" on public.projects;
create policy "Owners can see their own projects"
  on public.projects for select
  using ( auth.uid() = student_id );

drop policy if exists "Authenticated users can create projects" on public.projects;
create policy "Authenticated users can create projects"
  on public.projects for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Collaborators view their projects" on public.projects;
create policy "Collaborators view their projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.project_collaborators pc
      where pc.project_id = id
      and pc.student_id = auth.uid()
    )
  );

-- Collaborators Table
drop policy if exists "Authenticated users can add collaborators" on public.project_collaborators;
create policy "Authenticated users can add collaborators"
  on public.project_collaborators for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Users can update their own invitation status" on public.project_collaborators;
create policy "Users can update their own invitation status"
  on public.project_collaborators for update
  using ( auth.uid() = student_id )
  with check ( auth.uid() = student_id );

-- 3. Set default status to 'approved' for new projects in database level as well
alter table public.projects alter column status set default 'approved';

-- 4. Final confirmation of permissions
grant insert, select, update on public.projects to authenticated;
grant insert, select, update on public.project_collaborators to authenticated;
grant select on public.profiles to authenticated;
