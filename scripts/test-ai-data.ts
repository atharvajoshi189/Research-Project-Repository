import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Mock console.error to avoid noisy output if env vars are missing during import (though we try to load them first)
// But supabaseClient checks them at top level.

import { getProjectMetadataForAI } from '../src/lib/ai-data.ts';

async function main() {
    console.log('Testing getProjectMetadataForAI...');
    const result = await getProjectMetadataForAI();
    console.log('--- Result ---');
    console.log(result);
    console.log('--- End Result ---');
}

main().catch(err => console.error(err));
