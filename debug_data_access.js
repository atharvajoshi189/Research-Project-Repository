
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccess() {
    console.log('--- Debugging Data Access ---');

    // 1. Check Profiles (General)
    console.log('\n1. Fetching any 5 profiles...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(5);

    if (profileError) {
        console.error('Error fetching profiles:', profileError.message);
    } else {
        console.log(`Success! Found ${profiles.length} profiles.`);
        console.table(profiles);
    }

    // 2. Check Faculty specifically
    console.log('\n2. Fetching Faculty (role="faculty")...');
    const { data: faculty, error: facultyError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'faculty')
        .limit(5);

    if (facultyError) {
        console.error('Error fetching faculty:', facultyError.message);
    } else {
        console.log(`Found ${faculty.length} faculty members.`);
        if (faculty.length === 0) {
            console.log('Checking for "teacher" role instead...');
            const { data: teachers } = await supabase
                .from('profiles')
                .select('role')
                .eq('role', 'teacher')
                .limit(1);
            console.log(`Found ${teachers ? teachers.length : 0} users with role="teacher".`);
        }
        console.table(faculty);
    }
}

checkAccess();
