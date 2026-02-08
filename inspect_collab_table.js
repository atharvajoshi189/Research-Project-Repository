const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectCollabTable() {
    console.log('--- Inspecting project_collaborators ---');

    // 1. Get first row to see keys
    const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching one row:', error.message);
    } else if (data && data.length > 0) {
        console.log('Found row keys:', Object.keys(data[0]));
    } else {
        console.log('No rows found in project_collaborators. Cannot infer schema from data.');
        // If no data, try to select specific columns and see which errors.
        await testColumn('user_id');
        await testColumn('student_id');
        await testColumn('profile_id');
        await testColumn('collaborator_id');
    }
}

async function testColumn(colName) {
    const { error } = await supabase.from('project_collaborators').select(colName).limit(1);
    if (error) {
        console.log(`Column '${colName}' check FAILED: ${error.message}`);
    } else {
        console.log(`Column '${colName}' EXISTS.`);
    }
}

inspectCollabTable();
