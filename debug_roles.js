
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoles() {
    console.log('--- Checking Distinct Roles ---');

    // Fetch all roles to see what we are dealing with
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    // Count distinct roles
    const roleCounts = {};
    profiles.forEach(p => {
        const r = p.role || 'NULL';
        roleCounts[r] = (roleCounts[r] || 0) + 1;
    });

    console.table(roleCounts);

    // Specific check for case sensitivity
    const studentLower = profiles.filter(p => p.role === 'student').length;
    const studentCapital = profiles.filter(p => p.role === 'Student').length;
    const facultyLower = profiles.filter(p => p.role === 'faculty').length;
    const facultyCapital = profiles.filter(p => p.role === 'Faculty').length;
    const teacherLower = profiles.filter(p => p.role === 'teacher').length;

    console.log('Stats:');
    console.log(`- 'student': ${studentLower}`);
    console.log(`- 'Student': ${studentCapital}`);
    console.log(`- 'faculty': ${facultyLower}`);
    console.log(`- 'Faculty': ${facultyCapital}`);
    console.log(`- 'teacher': ${teacherLower}`);
}

checkRoles();
