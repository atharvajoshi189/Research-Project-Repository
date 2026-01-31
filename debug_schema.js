
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectTable() {
    console.log("Fetching one project to see structure...");
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        if (data.length > 0) {
            console.log("Columns found:", Object.keys(data[0]));
            console.log("Sample Data:", data[0]);
        } else {
            // If empty, try to insert a dummy to catch column errors? No, safer to just list columns if possible.
            // Supabase-js doesn't have 'describe table'.
            console.log("Table is empty, cannot infer columns from data.");
        }
    }
}

inspectTable();
