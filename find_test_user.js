
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function insertTestUser() {
    console.log('--- Inserting Test User ---');

    // 1. Check if exists
    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'beta@test.com')
        .single();

    if (existing) {
        console.log('Test user already exists.');
        return;
    }

    // 2. Insert (requires a valid UUID, so we might need a workaround if we aren't using real auth signup)
    // Actually, 'profiles' table usually relies on auth.users triggers.
    // We can't just insert into profiles if there is a foreign key constraint to auth.users.

    // Let's check if we can verify an *existing* user instead of creating one.
    console.log('Fetching random existing student to use as test case...');
    const { data: students } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('role', 'student')
        .limit(1);

    if (students && students.length > 0) {
        console.log(`\nValid Test Name: "${students[0].full_name}"`);
        console.log(`Instructions: Ask user to type "${students[0].full_name.split(' ')[0]}"`);
    } else {
        console.error('No students found in DB!');
    }
}

insertTestUser();
