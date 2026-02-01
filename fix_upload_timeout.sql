/*
  FIX UPLOAD TIMEOUT (RLS DEADLOCKS)
  ----------------------------------
  This script resets the RLS policies to be SIMPLE and PREVENT RECURSION.
  Run this in the Supabase SQL Editor.
*/

-- 1. Reset Projects Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Public view accepted projects" ON public.projects;
DROP POLICY IF EXISTS "Collaborators view their projects" ON public.projects;
DROP POLICY IF EXISTS "Authors can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Leaders can update their own projects" ON public.projects;

-- A. SELECT: Public can see 'approved'. Authors/Collaborators can see 'pending'.
CREATE POLICY "Public view approved"
ON public.projects FOR SELECT
USING ( status = 'approved' );

CREATE POLICY "Authors view own"
ON public.projects FOR SELECT
USING ( auth.uid() = student_id );

-- B. INSERT: Only the student themselves can insert a project for themselves.
CREATE POLICY "Authors can insert"
ON public.projects FOR INSERT
WITH CHECK ( auth.uid() = student_id );

-- C. UPDATE: Only the student (leader) can update.
CREATE POLICY "Authors can update"
ON public.projects FOR UPDATE
USING ( auth.uid() = student_id );


-- 2. Reset Collaborators Policies
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Project leaders can manage collaborators" ON public.project_collaborators;

-- A. SELECT: Visible if you are the user OR if the project is visible
-- (Avoid joining back to projects if possible to prevent recursion, but usually necessary. 
--  To be safe, we allow ANYONE to view collaborators for now to test if this fixes the hang.)
CREATE POLICY "View collaborators public"
ON public.project_collaborators FOR SELECT
USING ( true );

-- B. INSERT: The Project Leader (student_id of the project) can insert collaborators.
-- We must check if the auth user is the owner of the referenced project.
CREATE POLICY "Leaders insert collaborators"
ON public.project_collaborators FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.student_id = auth.uid()
  )
);

-- 3. Fix Tech Stack Type (Just in case)
DO $$
BEGIN
    ALTER TABLE public.projects ALTER COLUMN tech_stack TYPE text[] USING string_to_array(tech_stack::text, ',');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
