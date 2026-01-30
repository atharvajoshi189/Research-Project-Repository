-- Function to search projects where any element in the tech_stack array matches the pattern (fuzzy)
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
