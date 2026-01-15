-- Enable RLS just in case (it likely is already)
alter table public.project_collaborators enable row level security;

-- Policy to allow users to update THEIR OWN collaboration status (e.g., accept/reject)
-- Using 'student_id' as per your schema preference
create policy "Users can update their own invitation status"
  on public.project_collaborators for update
  using ( auth.uid() = student_id )
  with check ( auth.uid() = student_id );

-- Optional: If you sometimes use 'user_id' instead of 'student_id', you might need:
-- using ( auth.uid() = user_id );
-- But based on your request, we are strictly using 'student_id'.
