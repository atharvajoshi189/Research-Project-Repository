
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function dumpStudents() {
    console.log('--- Dumping All Students ---');

    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('role', 'student')
        .limit(200); // Get them all (132 exists)

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Retrieved ${data.length} students.`);

    // Sort for easier reading
    data.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    data.forEach(s => {
        console.log(`"${s.full_name}" <${s.email}>`);
    });
}

dumpStudents();
