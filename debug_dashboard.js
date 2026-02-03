
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
try {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.log("No .env.local found, assuming vars are in process or not needed if public");
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function debugDashboard() {
    console.log("--- Debugging Dashboard ---");

    // 1. Fetch recent projects
    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (projError) {
        console.error("Error fetching projects:", projError);
        return;
    }

    console.log(`Found ${projects.length} recent projects.`);


    const results = [];
    for (const p of projects) {
        const projData = {
            id: p.id,
            title: p.title,
            status: p.status,
            created_at: p.created_at,
            collaborators: []
        };

        const { data: collaborators, error: collabError } = await supabase
            .from('project_collaborators')
            .select('*')
            .eq('project_id', p.id);

        if (!collabError) {
            projData.collaborators = collaborators;
        }
        results.push(projData);
    }

    fs.writeFileSync('debug_results.json', JSON.stringify(results, null, 2));
    console.log("Written results to debug_results.json");
}

debugDashboard();
