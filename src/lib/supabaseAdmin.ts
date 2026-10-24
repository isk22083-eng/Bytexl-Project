import { createClient } from "@supabase/supabase-js";

// Server-only client using the Secret key — full access, bypasses RLS.
// NEVER import this from a Client Component or anything bundled to the
// browser. Only use it from API routes (src/app/api/**/route.ts).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const supabaseAdmin =
  url && secretKey
    ? createClient(url, secretKey, { auth: { persistSession: false } })
    : null;

export function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }
  return supabaseAdmin;
}

export const RECORDS_BUCKET = "health-records";

let bucketEnsured = false;

export async function ensureRecordsBucket() {
  if (bucketEnsured) return;
  const supabase = requireSupabaseAdmin();

  const { data: existing } = await supabase.storage.getBucket(RECORDS_BUCKET);
  if (!existing) {
    await supabase.storage.createBucket(RECORDS_BUCKET, { public: true });
  }
  bucketEnsured = true;
}
