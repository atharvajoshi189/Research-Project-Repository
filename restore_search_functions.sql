-- Restore search components

-- Drop existing functions to avoid signature conflicts (parameter name changes)
DROP FUNCTION IF EXISTS search_projects(text);
DROP FUNCTION IF EXISTS search_projects_by_tech(text);


-- 1. Search Logic (Strict & Fuzzy)
create or replace function search_projects(keyword text)
returns setof projects
language sql
security definer
as $$
  select distinct p.*
  from projects p
  left join profiles leader on p.student_id = leader.id
  left join project_collaborators pc on p.id = pc.project_id
  left join profiles member on pc.student_id = member.id
  where
    p.status = 'approved'
    and (
      p.title ilike '%' || keyword || '%'
      or array_to_string(p.tech_stack, ', ') ilike '%' || keyword || '%'
      or leader.full_name ilike '%' || keyword || '%'
      or member.full_name ilike '%' || keyword || '%'
    )
  order by p.created_at desc;
$$;

-- 2. Tech Stack Search (JSONB Array)
CREATE OR REPLACE FUNCTION search_projects_by_tech(tech_pattern TEXT)
RETURNS SETOF projects AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM projects
  WHERE status = 'approved'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(tech_stack) elem
    WHERE elem ILIKE '%' || tech_pattern || '%'
  );
END;
$$ LANGUAGE plpgsql;
