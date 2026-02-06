-- FIX INFINITE RECURSION AND UPLOAD ISSUES

-- 1. Helper Function to break recursion
-- This function checks if the current user is the owner of a project.
-- It runs with SECURITY DEFINER to bypass RLS on the 'projects' table, preventing the cycle.
CREATE OR REPLACE FUNCTION is_project_owner(_project_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM projects
    WHERE id = _project_id
    AND student_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for owners" ON projects;
DROP POLICY IF EXISTS "Enable delete for owners" ON projects;
DROP POLICY IF EXISTS "Public view" ON projects;
DROP POLICY IF EXISTS "Authenticated users can upload projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
-- Drop policies found in previous fix scripts
DROP POLICY IF EXISTS "Public view accepted projects" ON projects;
DROP POLICY IF EXISTS "Collaborators view their projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Owners can update own project" ON projects;
DROP POLICY IF EXISTS "Public projects are viewable by everyone." ON projects;
DROP POLICY IF EXISTS "Users can insert own project" ON projects;
DROP POLICY IF EXISTS "Users can update own project" ON projects;

DROP POLICY IF EXISTS "Enable read access for project members" ON project_collaborators;
DROP POLICY IF EXISTS "Enable insert for project members" ON project_collaborators;
DROP POLICY IF EXISTS "Enable delete for project members" ON project_collaborators;
DROP POLICY IF EXISTS "Collaborators can view their own records" ON project_collaborators;
-- Drop policies found in previous fix scripts for collaborators
DROP POLICY IF EXISTS "Collaborators viewable by everyone" ON project_collaborators;
DROP POLICY IF EXISTS "Authenticated users can insert collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Users can delete own collaboration" ON project_collaborators;

-- 3. PROJECTS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE to view projects (Dashboard needs this, typically)
-- If you want to restrict visibility, change 'true' to more specific logic.
-- But for a "Display Projects" dashboard, usually read is public or authenticated.
CREATE POLICY "Projects are viewable by everyone" 
ON projects FOR SELECT 
USING (true);

-- Insert: Authenticated users can insert their own project
CREATE POLICY "Users can create projects" 
ON projects FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Update: Only Owner (student_id) can update
CREATE POLICY "Owners can update projects" 
ON projects FOR UPDATE 
USING (auth.uid() = student_id);

-- Delete: Only Owner (student_id) can delete
CREATE POLICY "Owners can delete projects" 
ON projects FOR DELETE 
USING (auth.uid() = student_id);


-- 4. PROJECT_COLLABORATORS Policies
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

-- View: User can see record IF:
-- 1. They are the student in the record (view my own collabs)
-- 2. OR The project owner is looking (to see who is on their project)
-- We use the SECURITY DEFINER function here to avoid querying 'projects' table directly in a way that triggers its RLS (though with 'true' on projects select, it wouldn't recurse, but this is safer/robust).
CREATE POLICY "View collaborators" 
ON project_collaborators FOR SELECT 
USING (
  student_id = auth.uid() 
  OR is_project_owner(project_id)
);

-- Insert: Only Project Owner can add collaborators
CREATE POLICY "Project owner can add collaborators" 
ON project_collaborators FOR INSERT 
WITH CHECK (
  is_project_owner(project_id)
);

-- Delete: User can remove themselves OR Project Owner can remove them
CREATE POLICY "Remove collaborators" 
ON project_collaborators FOR DELETE 
USING (
  student_id = auth.uid() 
  OR is_project_owner(project_id)
);

-- 5. Fix PROFILES (Just in case)
-- Ensure profiles are readable so searching for users works
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 6. Grant permissions (Standard boilerplate)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
