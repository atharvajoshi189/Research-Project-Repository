
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
        return;
    }

    console.log('--- Collaborators Data ---');
    console.table(collabData);

    if (collabData.length > 0) {
        // 2. Fetch Profiles for these collaborators
        const studentIds = collabData.map(c => c.student_id);
        console.log('Fetching profiles for IDs:', studentIds);

        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', studentIds);

        if (profileError) {
            console.error('Error fetching profiles:', profileError);
        } else {
            console.log('--- Profiles Data ---');
            console.table(profiles);
        }
    } else {
        console.log('No collaborators found in project_collaborators table.');
    }

    // 3. Check the project itself to see who is the 'student_name' / 'student_id' (legacy owner)
    const { data: projectData, error: projError } = await supabase
        .from('projects')
        .select('id, title, student_name, student_id')
        .eq('id', projectId)
        .single();

    if (projError) {
        console.error('Error fetching project:', projError);
    } else {
        console.log('--- Project Data ---');
        console.log(projectData);
    }
}

checkCollaborators();
