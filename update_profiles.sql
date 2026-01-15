-- Create profiles table if it doesn't exist
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add new columns if they don't exist
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'academic_year') then
        alter table profiles add column academic_year text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'section') then
        alter table profiles add column section text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'college_id') then
        alter table profiles add column college_id text;
    end if;
end $$;
