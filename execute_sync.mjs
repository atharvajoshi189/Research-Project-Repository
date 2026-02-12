import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSync() {
    console.log("Reading sync_database.sql...");
    const sql = fs.readFileSync('sync_database.sql', 'utf8');

    console.log("Attempting to execute sync script via RPC...");
    // Note: This requires an 'exec_sql' function to exist in your Supabase DB.
    // Many developers add this for automation.
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        if (error.message.includes("function public.exec_sql(sql_query text) does not exist")) {
            console.error("❌ FAILED: The 'exec_sql' RPC function does not exist in your Supabase database.");
            console.log("\n⚠️ MANUAL ACTION REQUIRED:");
            console.log("Because for security reasons Supabase doesn't allow raw SQL from the client,");
            console.log("you MUST run the contents of 'sync_database.sql' manually in the Supabase SQL Editor.");
        } else {
            console.error("❌ RPC Error:", error.message);
        }
    } else {
        console.log("✅ Sync successful!");
    }
}

runSync();
