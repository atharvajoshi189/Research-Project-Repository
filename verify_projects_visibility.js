const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyProjects() {
    console.log('--- Verifying Projects Visibility ---');

    // 1. Check raw projects count
    const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Total Projects Count Error:', countError.message);
    else console.log(`Total projects in DB: ${count}`);

    // 2. Check Approved Projects
    const { data: approved, error: approvedError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'approved');

    if (approvedError) {
        console.error('Approved Projects Error:', approvedError.message);
    } else {
        console.log(`Approved projects count: ${approved.length}`);
        if (approved.length > 0) {
            console.log('Sample Approved Project Structure:', JSON.stringify(approved[0], null, 2));

            // Check specific fields used in Project3DCard
            const p = approved[0];
            console.log('CHECKING CRITICAL FIELDS:');
            console.log(`- id: ${p.id}`);
            console.log(`- title: ${p.title}`);
            console.log(`- category: ${p.category}`);
            console.log(`- year: ${p.year}`);
            console.log(`- authors: ${JSON.stringify(p.authors)} (Type: ${typeof p.authors}, IsArray: ${Array.isArray(p.authors)})`);
        }
    }

    // 3. Test RPC search_projects
    console.log('\n--- Testing RPC: search_projects ---');
    try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_projects', { keyword: '' });
        if (rpcError) {
            console.error('RPC search_projects Error:', rpcError.message);
        } else {
            console.log(`RPC returned ${rpcData ? rpcData.length : 0} results for empty keyword`);
        }
    } catch (e) {
        console.error('RPC Exception:', e);
    }
}

verifyProjects();
