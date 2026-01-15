-- Create projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  abstract text,
  authors text[] not null, -- Array of text for authors
  academic_year text, -- Renamed from year
  github_url text, -- New field
  pdf_url text,
  category text,
  status text default 'pending', -- approved, rejected, pending
  student_id uuid, -- Added missing field
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
