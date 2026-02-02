
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Profiles access...');

    // 1. Check if we can read ANY profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log('Fetched Profiles:', profiles);

    if (profiles && profiles.length > 0) {
        const first = profiles[0];
        console.log('First profile keys:', Object.keys(first));
        if ('role' in first) {
            console.log('Role column EXISTS. Value:', first.role);
        } else {
            console.error('CRITICAL: Role column MISSING in profiles table response.');
        }
    } else {
        console.warn('No profiles found. RLS might be blocking or table is empty.');
    }

    // 2. Check Role Distribution
    const { data: allProfiles } = await supabase.from('profiles').select('role');
    const roles = allProfiles?.map(p => p.role) || [];
    const distinctRoles = [...new Set(roles)];
    console.log('Distinct Roles found in DB:', distinctRoles);

    // 3. Test Teacher Query exactly as app does
    const { data: teachers, error: teacherError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['teacher', 'hod', 'HOD']);

    if (teacherError) {
        console.error('App-like Teacher Query Failed:', teacherError);
    } else {
        console.log(`App-like Teacher Query found ${teachers?.length} teachers.`);
        if (teachers?.length === 0) {
            console.warn("WARNING: App query returned 0 teachers. Check if roles are 'Teacher' (case sensitive) or if RLS hides them.");
        } else {
            console.log('Sample Teacher:', teachers?.[0]);
        }
    }
}

test();
