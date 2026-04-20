-- FUNCTION: Assign Project Guide (Admin/HOD Only)
-- This function allows Admins/HODs to update the guide of a project without giving them full UPDATE access to the projects table.
-- It bypasses RLS (SECURITY DEFINER) but includes a strict role check inside.

CREATE OR REPLACE FUNCTION public.assign_project_guide(
    p_project_id uuid,
    p_guide_id uuid,
    p_guide_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin)
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- 1. Check if the user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Check the user's role from the profiles table
    SELECT role INTO v_user_role
    FROM public.profiles
    WHERE id = auth.uid();

    -- 3. Enforce Permissions (Admin or HOD only)
    IF v_user_role NOT IN ('admin', 'hod') THEN
        RAISE EXCEPTION 'Unauthorized: Only Admins or HODs can assign guides.';
    END IF;

    -- 4. Perform the Update (Strictly limited to guide columns)
    UPDATE public.projects
    SET 
        guide_id = p_guide_id,
        guide_name = p_guide_name,
        updated_at = now() -- Optional: keep track of updates
    WHERE id = p_project_id;

    -- 5. Optional: Handle case where project doesn't exist?
    -- Update will just do nothing if ID doesn't match, which is fine.
    
END;
$$;

-- Grant execute permission to authenticated users (the function protects itself)
GRANT EXECUTE ON FUNCTION public.assign_project_guide TO authenticated;
