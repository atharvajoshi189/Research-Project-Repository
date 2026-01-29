
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function debug() {
    console.log('--- Debugging Students ---');

    // 1. Get ANY 3 students
    const { data: students, error: err1 } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('role', 'student')
        .limit(3);

    if (err1) console.error('Error fetching students:', err1.message);
    else {
        console.log('Found these students:', students);
    }

    // 2. Search for "Gouri"
    console.log('\n--- Searching for "Gouri" ---');
    const { data: q1, error: e1 } = await supabase.from('profiles').select('full_name, role').ilike('full_name', '%Gouri%');
    if (e1) console.error(e1.message);
    else console.log('Matches (Any Role):', q1);
}

debug();
