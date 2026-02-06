
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yyokxbpmkvtgwpzhmtxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5b2t4YnBta3Z0Z3dwemhtdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MjA1NTEsImV4cCI6MjA4Mjk5NjU1MX0.vj5lTvpr34rR1I_wbRUL89y1-cQaatt0RRkvakFR2go';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .ilike('title', '%Multimodal%')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Project Found. Keys:', Object.keys(data[0]));
            console.log('Sample Data:', data[0]);
        } else {
            console.log('No project found.');
        }
    }
}

inspectSchema();
