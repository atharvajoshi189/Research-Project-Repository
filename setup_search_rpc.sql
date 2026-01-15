-- Function to search projects by title, tech_stack, leader name, or collaborator name
create or replace function search_projects(keyword text)
returns setof projects
language sql
security definer
as $$
  select distinct p.*
  from projects p
  left join profiles leader on p.student_id = leader.id
  left join project_collaborators pc on p.id = pc.project_id
  left join profiles member on pc.user_id = member.id
  where
    p.status = 'approved'
    and (
      p.title ilike '%' || keyword || '%'
      or p.tech_stack ilike '%' || keyword || '%'
      or leader.full_name ilike '%' || keyword || '%'
      or member.full_name ilike '%' || keyword || '%'
    )
  order by p.created_at desc;
$$;
