
-- Add remarks column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Ensure status is a valid column (it should be, but just in case)
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Optional: Ensure default constraint for status
-- ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'pending';
