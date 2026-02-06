const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yyokxbpmkvtgwpzhmtxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5b2t4YnBta3Z0Z3dwemhtdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MjA1NTEsImV4cCI6MjA4Mjk5NjU1MX0.vj5lTvpr34rR1I_wbRUL89y1-cQaatt0RRkvakFR2go';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteSpam() {
    console.log("Searching for project 'sjdsjd'...");
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .ilike('title', 'sjdsjd');

    if (error) {
        console.error("Error searching:", error);
        return;
    }

    console.log(`Found ${data.length} projects to delete.`);

    if (data.length > 0) {
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('title', 'sjdsjd');

        if (deleteError) {
            console.error("Error deleting:", deleteError);
        } else {
            console.log("Successfully deleted spam project(s).");
        }
    } else {
        // Checking for case sensitive
        console.log("Trying exact match if ilike failed to find proper string...");
        const { data: data2 } = await supabase
            .from('projects')
            .select('*')
            .eq('title', 'sjdsjd');

        console.log(`Found ${data2 ? data2.length : 0} projects with strict equality.`);
        if (data2 && data2.length > 0) {
            const { error: deleteError } = await supabase
                .from('projects')
                .delete()
                .eq('title', 'sjdsjd');
            if (!deleteError) console.log("Deleted via strict match.");
        }
    }
}

deleteSpam();
