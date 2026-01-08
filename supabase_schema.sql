-- Create projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  abstract text,
  authors text[] not null, -- Array of text for authors
  year int,
  pdf_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
