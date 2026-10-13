import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Hackathon-demo setup: a single shared anon client, RLS kept open on the
// demo tables. Do not reuse this pattern for a real multi-user deployment.
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}
