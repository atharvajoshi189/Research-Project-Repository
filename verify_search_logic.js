
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySearch() {
    console.log('--- Verifying Search Logic ---');

    // 1. Count Total Students
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

    if (countError) console.error('Count Error:', countError.message);
    else console.log(`Total 'student' profiles: ${count}`);

    // 2. Search for a specific existing user (Kunal)
    const query = 'Kunal';
    console.log(`\nSearching for '${query}' with role='student'...`);

    const { data: results, error: searchError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'student')
        .ilike('full_name', `%${query}%`) // % wildcard is crucial
        .limit(5);

    if (searchError) {
        console.error('Search Error:', searchError.message);
    } else {
        console.log(`Found ${results.length} matches:`);
        console.table(results);
    }

    // 3. Search for very common letter 'a'
    console.log(`\nSearching for 'a' (should return many)...`);
    const { data: common, error: commonError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('role', 'student')
        .ilike('full_name', '%a%')
        .limit(3);

    if (commonError) console.error(commonError.message);
    else console.log('Sample matches:', common.map(c => c.full_name));
}

verifySearch();
