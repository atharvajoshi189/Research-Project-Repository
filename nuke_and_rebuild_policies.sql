-- DYNAMICALLY DROP ALL POLICIES to ensure no "Ghost" policies remain
-- Run this in Supabase SQL Editor

DO $$ 
DECLARE 
    pol record; 
BEGIN 
    -- 1. Drop all policies on 'projects'
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'projects' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', pol.policyname); 
    END LOOP;

    -- 2. Drop all policies on 'project_collaborators'
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_collaborators' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_collaborators', pol.policyname); 
    END LOOP;

    -- 3. Drop all policies on 'profiles' (just to be clean)
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname); 
    END LOOP;
END $$;


-- ==========================================
-- NOW RECREATE THE SAFE POLICIES
-- ==========================================

-- 1. Helper Function (Ensure it uses BIGINT)
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


-- 2. PROJECTS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- View: Everyone (needed for Dashboard)
CREATE POLICY "Projects are viewable by everyone" 
ON projects FOR SELECT 
USING (true);

-- Insert: Authenticated users can insert
CREATE POLICY "Authenticated users can create projects" 
ON projects FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Update: Only Owner
CREATE POLICY "Owners can update projects" 
ON projects FOR UPDATE 
USING (auth.uid() = student_id);

-- Delete: Only Owner
CREATE POLICY "Owners can delete projects" 
ON projects FOR DELETE 
USING (auth.uid() = student_id);


-- 3. PROJECT_COLLABORATORS Policies
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

-- View: Self OR Project Owner
-- Using SECURITY DEFINER function to break recursion
CREATE POLICY "View collaborators" 
ON project_collaborators FOR SELECT 
USING (
  student_id = auth.uid() 
  OR is_project_owner(project_id)
);

-- Insert: Project Owner only
CREATE POLICY "Project owner can add collaborators" 
ON project_collaborators FOR INSERT 
WITH CHECK (
  is_project_owner(project_id)
);

-- Delete: Self OR Project Owner
CREATE POLICY "Remove collaborators" 
ON project_collaborators FOR DELETE 
USING (
  student_id = auth.uid() 
  OR is_project_owner(project_id)
);

-- 4. PROFILES Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);
