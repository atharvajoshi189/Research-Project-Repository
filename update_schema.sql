-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS guide_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS downloads integer DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_feedback text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tech_stack text[]; -- Array of strings

-- Function to increment project views safely
CREATE OR REPLACE FUNCTION increment_views(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET views = views + 1
  WHERE id = row_id;
END;
$$;

-- Function to increment project downloads safely
CREATE OR REPLACE FUNCTION increment_downloads(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET downloads = downloads + 1
  WHERE id = row_id;
END;
$$;
