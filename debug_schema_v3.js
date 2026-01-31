
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectTable() {
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    if (error) {
        fs.writeFileSync('schema_dump.txt', "ERROR: " + JSON.stringify(error));
    } else if (data.length > 0) {
        fs.writeFileSync('schema_dump.txt', "KEYS: " + JSON.stringify(Object.keys(data[0])));
    } else {
        fs.writeFileSync('schema_dump.txt', "EMPTY_TABLE");
    }
}

inspectTable();
