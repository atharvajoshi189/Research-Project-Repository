-- 1. Enable RLS on Projects (just to be safe)
alter table public.projects enable row level security;

-- 2. Allow ANYONE to view "approved" projects (Public Access)
drop policy if exists "Public view accepted projects" on public.projects;
create policy "Public view accepted projects"
  on public.projects for select
  using ( status = 'approved' );

-- 3. Allow Collaborators (Leader/Contributor/Pending) to view their OWN projects
-- This ensures that even if a project is pending or rejected, the team can see it.
-- Crucially, this allows "pending" invitees to see the project details to accept/reject.
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
