
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env vars
try {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.log("No .env.local found, assuming vars are in process");
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Using SERVICE ROLE KEY (Admin Mode)");
} else {
    console.log("Using ANON KEY (Client Mode) - This might fail due to RLS");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrphanedProjects() {
    console.log("--- Fixing Orphaned Projects ---");

    // 1. Fetch all recent projects (limit 50 to be safe)
    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (projError) {
        console.error("Error fetching projects:", projError);
        return;
    }

    let fixedCount = 0;

    for (const p of projects) {
        // 2. Check for collaborators
        const { data: collaborators, error: collabError } = await supabase
            .from('project_collaborators')
            .select('*')
            .eq('project_id', p.id);

        if (collabError) {
            console.error(`Error checking collaborators for project ${p.id}:`, collabError);
            continue;
        }

        if (collaborators.length === 0) {
            console.log(`Fixing Project: "${p.title}" (ID: ${p.id}) - No collaborators found.`);

            if (!p.student_id) {
                console.log(`  [SKIP] Cannot fix: No student_id (uploader) record in project.`);
                continue;
            }

            // 3. Insert Leader
            const newCollaborator = {
                project_id: p.id,
                student_id: p.student_id,
                role: 'leader',
                status: 'accepted'
            };

            const { error: insertError } = await supabase
                .from('project_collaborators')
                .insert([newCollaborator]);

            if (insertError) {
                console.error(`  [FAILED] Could not insert leader: ${insertError.message}`);
            } else {
                console.log(`  [SUCCESS] Linked owner (ID: ${p.student_id}) as leader.`);
                fixedCount++;
            }
        }
    }

    console.log(`\nOperation Complete. Fixed ${fixedCount} projects.`);
}

fixOrphanedProjects();
