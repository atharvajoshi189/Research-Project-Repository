import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debugging ke liye (Agar undefined aaye toh samjho .env read nahi hui)
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)