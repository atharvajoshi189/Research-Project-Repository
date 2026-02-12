import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSync() {
    console.log("Checking database schema status...");

    // Try to query project_collaborators with user_id
    const { error: errorWithUser } = await supabase
        .from('project_collaborators')
        .select('user_id')
        .limit(1);

    if (!errorWithUser) {
        console.log("✅ Database is synced: 'user_id' column exists in 'project_collaborators'.");
        return true;
    }

    // Try to query project_collaborators with student_id
    const { error: errorWithStudent } = await supabase
        .from('project_collaborators')
        .select('student_id')
        .limit(1);

    if (!errorWithStudent) {
        console.log("❌ Database is NOT synced: 'student_id' column still exists. Please run sync_database.sql in Supabase Dashboard.");
        return false;
    }

    console.log("⚠️ Could not determine status. Both queries failed. (Possibly RLS issues)");
    console.log("Error with user_id:", errorWithUser.message);
    console.log("Error with student_id:", errorWithStudent.message);
    return null;
}

checkSync();
