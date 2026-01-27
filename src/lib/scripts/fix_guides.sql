-- Utility Script to Fix Legacy Projects
-- Run this in the Supabase SQL Editor

-- 1. Check for unassigned projects
SELECT id, title, guide_name FROM projects WHERE guide_id IS NULL AND guide_name IS NOT NULL;

-- 2. Update projects based on matching names in profiles (Case Insensitive)
UPDATE projects
SET guide_id = profiles.id
FROM profiles
WHERE 
    projects.guide_id IS NULL 
    AND projects.guide_name IS NOT NULL
    AND LOWER(TRIM(projects.guide_name)) = LOWER(TRIM(profiles.full_name))
    AND profiles.role = 'teacher';

-- 3. Verify updates
SELECT id, title, guide_name, guide_id FROM projects WHERE guide_name IS NOT NULL;

-- 4. List projects that arguably still need manual assignment (No match found)
SELECT id, title, guide_name FROM projects WHERE guide_id IS NULL AND guide_name IS NOT NULL;
