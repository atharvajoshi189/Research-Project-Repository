-- Add status column to project_collaborators
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'project_collaborators' and column_name = 'status') then
        alter table project_collaborators add column status text default 'pending' check (status in ('pending', 'accepted', 'rejected'));
    end if;
end $$;
