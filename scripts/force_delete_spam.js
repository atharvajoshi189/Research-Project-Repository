const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yyokxbpmkvtgwpzhmtxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5b2t4YnBta3Z0Z3dwemhtdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MjA1NTEsImV4cCI6MjA4Mjk5NjU1MX0.vj5lTvpr34rR1I_wbRUL89y1-cQaatt0RRkvakFR2go';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndDelete() {
    console.log("Searching for 'sjd'...");

    const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .ilike('title', '%sjd%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Found:", JSON.stringify(data, null, 2));

    if (data.length > 0) {
        for (const p of data) {
            console.log(`Deleting ID: ${p.id}, Title: ${p.title}`);
            const { error: delErr } = await supabase.from('projects').delete().eq('id', p.id);
            if (delErr) console.error(`Failed to delete ${p.id}:`, delErr);
            else console.log(`Deleted ${p.id} successfully.`);
        }
    } else {
        console.log("No matching projects found.");
    }
}

findAndDelete();
