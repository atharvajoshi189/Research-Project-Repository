const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yyokxbpmkvtgwpzhmtxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5b2t4YnBta3Z0Z3dwemhtdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MjA1NTEsImV4cCI6MjA4Mjk5NjU1MX0.vj5lTvpr34rR1I_wbRUL89y1-cQaatt0RRkvakFR2go';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSpam() {
    console.log("Inspecting projects...");

    // Fetch ALL projects to see what's going on, limiting to recent ones or just filtering locally
    const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error searching:", error);
        return;
    }

    console.log("Recent Projects:");
    data.forEach(p => {
        // Check if title resembles "sjd"
        if (p.title.includes('sjd')) {
            console.log(`[MATCH] ID: ${p.id}, Title: '${p.title}', Status: ${p.status}`);
        } else {
            console.log(`ID: ${p.id}, Title: '${p.title}', Status: ${p.status}`);
        }
    });
}

inspectSpam();
