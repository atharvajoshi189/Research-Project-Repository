const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not load .env.local", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getProjectMetadataForAI() {
    console.log("Fetching projects...");
    const { data, error } = await supabase
        .from('projects')
        .select('id, title, abstract, tech_stack, authors, guide_name, academic_year')
        .eq('status', 'approved');

    if (error) {
        console.error('Error fetching project metadata for AI:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No approved projects found.');
        return;
    }

    console.log(`Found ${data.length} projects.`);

    const formattedData = data.map((project) => {
        const parts = [
            `Project ID: ${project.id}`,
            `Title: ${project.title}`,
            `Tech: ${Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : project.tech_stack || 'N/A'}`,
            `Authors: ${Array.isArray(project.authors) ? project.authors.join(', ') : project.authors || 'N/A'}`,
            `Guide: ${project.guide_name || 'N/A'}`,
            `Year: ${project.academic_year || 'N/A'}`,
            `Summary: ${project.abstract || 'No abstract available'}`,
        ];
        return parts.join(' | ');
    }).join('\n\n');

    console.log("--- FORMATTED DATA ---");
    console.log(formattedData);
}

getProjectMetadataForAI();
