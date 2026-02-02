
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking project_collaborators schema...');

    // Try to insert a dummy row to see what columns trigger errors, 
    // OR just select and look at the error if a column is incorrect.
    // Actually, we can check information_schema via RPC if possible, but standard client doesn't allow easy schema inspection without admin rights usually.
    // We can try to select specific columns and see which one fails.

    // Test 1: Try to select 'user_id'
    const { error: userError } = await supabase
        .from('project_collaborators')
        .select('user_id')
        .limit(1);

    if (userError) {
        console.log("Column 'user_id' check failed:", userError.message);
    } else {
        console.log("Column 'user_id' exists and is accessible.");
    }

    // Test 2: Try to select 'student_id'
    const { error: studentError } = await supabase
        .from('project_collaborators')
        .select('student_id')
        .limit(1);

    if (studentError) {
        console.log("Column 'student_id' check failed:", studentError.message);
    } else {
        console.log("Column 'student_id' exists and is accessible.");
    }

    // Test 3: Try to select 'project_id'
    const { error: projectError } = await supabase
        .from('project_collaborators')
        .select('project_id')
        .limit(1);

    if (projectError) {
        console.log("Column 'project_id' check failed:", projectError.message);
    } else {
        console.log("Column 'project_id' exists and is accessible.");
    }
}

checkSchema();
