
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use SERVICE ROLE key to bypass RLS for schema validation first
// If this works, then the issue is RLS or Frontend. If this fails, it's Schema/DB.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpload() {
    console.log("--- Starting Manual Upload Test ---");

    // 1. Get a Student (Author)
    const { data: students, error: sErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student')
        .limit(1);

    if (sErr || !students.length) {
        console.error("FATAL: Could not find any student.", sErr);
        return;
    }
    const student = students[0];
    console.log(`Using Student: ${student.full_name} (${student.id})`);

    // 2. Get a Teacher (Guide)
    const { data: teachers, error: tErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['teacher', 'hod', 'HOD'])
        .limit(1);

    if (tErr || !teachers.length) {
        console.error("FATAL: Could not find any teacher.", tErr);
        return;
    }
    const teacher = teachers[0];
    console.log(`Using Guide: ${teacher.full_name} (${teacher.id})`);

    // 3. Prepare Payload (Identical to Frontend)
    const payload = {
        title: "Manual Test Project " + Date.now(),
        abstract: "This is a test abstract uploaded via script.",
        category: "Mini Project",
        authors: [student.full_name],
        tech_stack: ["Node.js", "Script"],
        pdf_url: "https://drive.google.com/file/d/test/view",
        github_url: "https://github.com/test",
        guide_name: teacher.full_name,
        guide_id: teacher.id,
        status: "pending",
        student_id: student.id,
        academic_year: "2024-2025"
    };

    console.log("Payload:", payload);

    // 4. Attempt Insert
    const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select();

    if (error) {
        console.error("\n❌ INSERT FAILED!");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Details:", error.details);
    } else {
        console.log("\n✅ INSERT SUCCESS!");
        console.log("Inserted Project:", data);

        // Clean up
        console.log("Cleaning up test project...");
        await supabase.from('projects').delete().eq('id', data[0].id);
        console.log("Cleanup done.");
    }
}

testUpload();
