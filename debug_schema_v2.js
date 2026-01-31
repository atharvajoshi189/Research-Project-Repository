
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectTable() {
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    if (error) {
        console.log("ERROR:", JSON.stringify(error));
    } else if (data.length > 0) {
        console.log("KEYS:", JSON.stringify(Object.keys(data[0])));
    } else {
        console.log("EMPTY_TABLE");
    }
}

inspectTable();
