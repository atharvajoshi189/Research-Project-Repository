
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCollaborators() {
    const projectId = 14;
    let output = '';

    const log = (msg) => output += `${msg}\n`;

    log(`Checking collaborators for Project ID: ${projectId}...`);

    try {
        // 1. Fetch Collaborators for the project
        const { data: collabData, error: collabError } = await supabase
            .from('project_collaborators')
            .select('*')
            .eq('project_id', projectId);

        if (collabError) {
            log(`Error fetching collaborators: ${JSON.stringify(collabError)}`);
        } else {
            log('--- Collaborators Data ---');
            log(JSON.stringify(collabData, null, 2));

            if (collabData.length > 0) {
                const studentIds = collabData.map(c => c.student_id);
                log(`Fetching profiles for IDs: ${studentIds}`);
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', studentIds);

                if (profileError) {
                    log(`Error fetching profiles: ${JSON.stringify(profileError)}`);
                } else {
                    log('--- Profiles Data ---');
                    log(JSON.stringify(profiles, null, 2));
                }
            }
        }

        // 2. Check the project owner
        log('--- Project Owner Check ---');
        const { data: projectData, error: projError } = await supabase
            .from('projects')
            .select('student_id')
            .eq('id', projectId)
            .single();

        if (projError) {
            log(`Error fetching project: ${JSON.stringify(projError)}`);
        } else {
            log(`Project Owner ID: ${projectData.student_id}`);
            // Check project owner profile
            const { data: ownerProfile, error: ownerError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', projectData.student_id)
                .single();
            if (ownerError) {
                log(`Error fetching owner profile: ${JSON.stringify(ownerError)}`);
            } else {
                log(`Owner Full Name: ${ownerProfile.full_name}`);
            }
        }

    } catch (err) {
        log(`Unexpected Error: ${err}`);
    }

    fs.writeFileSync('debug_output_v3.txt', output);
    console.log('Done writing debug output to debug_output_v3.txt');
}

checkCollaborators();
