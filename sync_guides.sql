-- Sync Guide IDs based on legacy guide_name text
-- This updates projects where guide_id IS NULL but guide_name matches a profile's full_name

UPDATE projects
SET guide_id = profiles.id
FROM profiles
WHERE 
    projects.guide_id IS NULL 
    AND projects.guide_name IS NOT NULL 
    AND projects.guide_name <> ''
    AND LOWER(TRIM(projects.guide_name)) = LOWER(TRIM(profiles.full_name))
    AND profiles.role IN ('teacher', 'faculty', 'hod');

-- Optional: Verify the update
-- SELECT id, title, guide_name, guide_id FROM projects WHERE guide_name IS NOT NULL;
