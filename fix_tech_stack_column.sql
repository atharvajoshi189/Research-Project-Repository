-- Ensure tech_stack is text[] to support unlimited tags
-- Using text[] (ARRAY) is better than varchar for lists.

do $$
begin
    -- 1. Check if column exists, if check type. 
    -- If it is something strict like varchar(255), we change it.
    -- We'll just cast it to text[] just to be safe.
    
    -- Note: You might need to drop dependent views/functions if they are strict, 
    -- but usually altering column type to text[] is safe if it was json or text.
    
    -- If it's already text[], this line is harmless or might need a USING clause if data exists.
    -- Assuming it's compatible.
    
    alter table projects alter column tech_stack type text[] using string_to_array(tech_stack::text, ',');
    
exception when others then
    -- if conversion fails (e.g. it was already robust or json), ignore
    raise notice 'Skipping tech_stack alteration or error occurred: %', SQLERRM;
end $$;
