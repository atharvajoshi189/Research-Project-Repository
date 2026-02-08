
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCollaborators() {
    const projectId = 14;
    console.log(`Checking collaborators for Project ID: ${projectId}...`);

    // 1. Fetch Collaborators for the project
    const { data: collabData, error: collabError } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId);

    if (collabError) {
        console.error('Error fetching collaborators:', collabError);
    } else {
        console.log('--- Collaborators Data ---');
        console.table(collabData);
    }

    // 2. Check the project itself 
    // Does 'student_name' exist? Let's check keys returned by select('*')
    const { data: projectData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (projError) {
        console.error('Error fetching project:', projError);
    } else {
        console.log('--- Project Data Keys ---');
        console.log(Object.keys(projectData));
        console.log('Student ID:', projectData.student_id);
    }
}

checkCollaborators();
