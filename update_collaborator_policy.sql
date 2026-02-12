-- POLICY UPDATE: Allow collaborators to see projects they are assigned to, even if pending.
-- This ensures the Dashboard can fetch these projects for the "Pending Invitations" and "Active Projects" sections.

-- 1. Ensure 'projects' table has the policy
DROP POLICY IF EXISTS "Collaborators view their projects" ON public.projects;
CREATE POLICY "Collaborators view their projects"
ON public.projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_collaborators pc
    WHERE pc.project_id = id
    AND pc.student_id = auth.uid()
  )
);

-- 2. Ensure 'project_collaborators' table is viewable by the user themselves
-- (This should already be covered by generic policies, but let's be explicit for the user's specific need)
DROP POLICY IF EXISTS "Users can view their own collaborations" ON public.project_collaborators;
CREATE POLICY "Users can view their own collaborations"
ON public.project_collaborators FOR SELECT
USING ( student_id = auth.uid() );

-- 3. Also grant necessary permissions if not already present
GRANT SELECT ON public.projects TO authenticated;
GRANT SELECT ON public.project_collaborators TO authenticated;
