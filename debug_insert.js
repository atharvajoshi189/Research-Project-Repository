
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY); // USING SERVICE ROLE KEY TO BYPASS RLS

async function testInsert() {
    console.log("Attempting direct insert with SERVICE ROLE KEY...");

    const payload = {
        title: "Debug Insert " + Date.now(),
        abstract: "Debug Abstract",
        category: "Final Year Project",
        status: "pending",
        tech_stack: ["Debug"],
        pdf_url: "https://example.com"
        // student_id: usually required, but let's see if we can insert with minimal fields or if it fails on constraint.
        // If we have a authenticated user ID from previous logs we could use it, but service role should assume identity if we want, or just insert raw.
        // Let's try to insert without student_id first, if it fails on not null constraint, we'll know connection is at least working.
    };

    const startTime = Date.now();

    try {
        const { data, error } = await supabase
            .from('projects')
            .insert(payload)
            .select();

        const duration = Date.now() - startTime;
        console.log(`Operation took ${duration}ms`);

        if (error) {
            console.error("Insert Error:", error);
        } else {
            console.log("Insert Success:", data);
        }
    } catch (err) {
        console.error("Exception:", err);
    }
}

testInsert();
