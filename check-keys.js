const fs = require('fs');
const pathModule = require('path');
const path = pathModule.join(process.cwd(), '.env.local');

if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);
    let urlVal = '';
    let keyVal = '';
    lines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) urlVal = line.split('=')[1] || '';
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) keyVal = line.split('=')[1] || '';
    });
    console.log(`URL Start: ${urlVal.trim().substring(0, 5)}...`);
    console.log(`Key Start: ${keyVal.trim().substring(0, 5)}...`);
} else {
    console.log("No .env.local found");
}
