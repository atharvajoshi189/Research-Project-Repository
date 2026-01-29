const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(process.cwd(), '.env.local');
let logOutput = "";

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    logOutput += "Parsed keys from .env.local:\n";
    Object.keys(envConfig).forEach(key => {
        const value = envConfig[key];
        const status = value && value.length > 0 && !value.includes("INSERT_SUPABASE") ? "VALID" : "INVALID/EMPTY/PLACEHOLDER";
        logOutput += ` - ${key}: [${status}] (Length: ${value ? value.length : 0})\n`;
    });
} else {
    logOutput += ".env.local file not found\n";
}

fs.writeFileSync('env-debug.log', logOutput);
