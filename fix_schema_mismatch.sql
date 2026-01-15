-- FIX SCRIPT: Run this to ensure your database schema matches the code.

-- 1. Rename 'student_id' to 'user_id' in 'project_collaborators' if it exists
do $$
begin
  if exists(select column_name from information_schema.columns where table_name='project_collaborators' and column_name='student_id') then
    alter table project_collaborators rename column student_id to user_id;
  end if;
end $$;

-- 2. Add 'status' column to 'project_collaborators' if it is missing
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'project_collaborators' and column_name = 'status') then
        alter table project_collaborators add column status text default 'pending' check (status in ('pending', 'accepted', 'rejected'));
    end if;
end $$;

-- 3. Ensure 'projects' table has 'student_id' (It should, but checking just in case)
-- (No action needed usually as this is the owner column)

-- 4. Re-apply the Search RPC function to ensure it uses the correct column names
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
