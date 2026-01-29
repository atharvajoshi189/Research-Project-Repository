import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)