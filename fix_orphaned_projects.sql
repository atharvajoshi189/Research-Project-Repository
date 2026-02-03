
-- Fix Orphaned Projects
-- Inserts a 'leader' record into project_collaborators for any project that has a student_id
-- but no corresponding entry in project_collaborators.

INSERT INTO project_collaborators (project_id, student_id, role, status)
SELECT 
    p.id, 
    p.student_id, 
    'leader', 
    'accepted'
FROM projects p
WHERE p.student_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 
      FROM project_collaborators pc 
      WHERE pc.project_id = p.id
  );

-- Verify the fix
SELECT p.title, p.student_id, 'Fixed' as status
FROM projects p
JOIN project_collaborators pc ON p.id = pc.project_id
WHERE pc.created_at > now() - interval '1 minute';
