const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log(`Checking ${envPath}...`);

try {
    if (!fs.existsSync(envPath)) {
        console.log("❌ .env.local file not found!");
    } else {
        const buffer = fs.readFileSync(envPath);
        let content = buffer.toString('utf8');

        // Heuristic for UTF-16 (common if pasted from Notepad sometimes)
        // If we see many null bytes, it's likely UTF-16
        if (content.includes('\u0000')) {
            console.log("⚠️ Detected UTF-16 encoding. Converting to UTF-8...");
            content = buffer.toString('utf16le');
        }

        // Split lines and clean them
        const lines = content.split(/\r?\n/);
        const cleanLines = lines
            .map(line => line.trim()) // Remove whitespace
            .filter(line => line.length > 0); // Remove empty lines

        console.log(`FOUND ${cleanLines.length} lines.`);

        cleanLines.forEach(line => {
            if (!line.includes('=')) {
                console.log(`⚠️ WARNING: Invalid line (no '='): "${line}"`);
            } else {
                const [key] = line.split('=');
                console.log(`   KEY: ${key}`);
            }
        });

        const newContent = cleanLines.join('\n');
        fs.writeFileSync(envPath, newContent, { encoding: 'utf8' });
        console.log("✅ Rewrote .env.local with standard UTF-8 encoding.");
    }
} catch (e) {
    console.error("Error processing file:", e);
}
