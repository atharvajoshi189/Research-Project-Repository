
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function debugStudentSearch() {
    const query = 'Gouri';
    console.log(`Searching for "${query}"...`);

    // 1. Direct Search (No Role Filter)
    const { data: allMatches, error: matchError } = await supabase
        .from('profiles')
        .select('id, full_name, role, email')
        .ilike('full_name', `%${query}%`);

    if (matchError) {
        console.error('Search Error:', matchError.message);
    } else {
        console.log('\n--- Direct Matches (Any Role) ---');
        console.table(allMatches);
    }

    // 2. Search with Student Role Filter (What the app does)
    const { data: studentMatches, error: studentError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'student')
        .ilike('full_name', `%${query}%`);

    if (studentError) {
        console.error('Student Filter Error:', studentError.message);
    } else {
        console.log('\n--- Matches with role="student" ---');
        console.table(studentMatches);
    }
}

debugStudentSearch();
