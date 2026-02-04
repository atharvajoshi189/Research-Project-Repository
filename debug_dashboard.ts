
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDashboard() {
    console.log("--- Debugging Dashboard Data ---");

    // 1. Fetch ALL project_collaborators to see if ANY exist
    const { data: allCollabs, error: collabError } = await supabase
        .from('project_collaborators')
        .select('*')
        .limit(10);

    if (collabError) {
        console.error("Error fetching collaborators:", collabError);
        return;
    }

    console.log(`Found ${allCollabs?.length} collaborator records.`);

    if (allCollabs && allCollabs.length > 0) {
        console.log("Sample collaborator:", allCollabs[0]);

        const sample = allCollabs[0];
        const projectId = sample.project_id;

        // 2. Try to fetch the project linked to this collaborator
        const { data: project, error: projError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projError) {
            console.error(`Error fetching project ${projectId}:`, projError);
            console.error("Likely Cause: RLS is hiding this project.");
        } else if (!project) {
            console.error(`Project ${projectId} returned NULL (Data missing?)`);
        } else {
            console.log("Project fetched successfully:", project.title);
            console.log("STATUS:", project.status);
        }
    } else {
        console.warn("No collaborators found at all. Insert might have failed.");
    }
}

debugDashboard();
