
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugJoin() {
    console.log("--- Debugging JOIN Query ---");
    // 1. Get a student ID from collab table
    const { data: collabs } = await supabase.from('project_collaborators').select('student_id').limit(1);
    if (!collabs || collabs.length === 0) {
        console.log("No collaborators found.");
        return;
    }
    const userId = collabs[0].student_id;
    console.log("Testing with User ID:", userId);

    // 2. Run the exact Dashboard Query
    const { data, error } = await supabase
        .from('project_collaborators')
        .select('*, projects(*)')
        .eq('student_id', userId);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log(`Returned ${data?.length} rows.`);
        if (data && data.length > 0) {
            data.forEach((row, i) => {
                console.log(`[Row ${i}] role: ${row.role}, status: ${row.status}`);
                console.log(`[Row ${i}] projects:`, row.projects ? "FOUND" : "NULL (RLS BLOCKING?)");
                if (row.projects) {
                    console.log(`   -> Title: ${row.projects.title}`);
                }
            });
        }
    }
}
debugJoin();
