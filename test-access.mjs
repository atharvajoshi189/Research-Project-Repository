import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase.from('projects').select('id, title').limit(1);
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Success! Data found:", data);
    }
}

test();
