import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side only. The service-role key bypasses row-level security, so it must never reach the browser:
// every file that imports this one runs on the server (route handlers, server actions, server components).
let cached: SupabaseClient | null = null;

export const dbConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/** The database client, or null when Supabase is not set up (the site then runs in demo mode). */
export function getDb(): SupabaseClient | null {
  if (!dbConfigured()) return null;
  cached ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** A separate client with the public key, used only to check an admin's email and password. */
export function getAuthClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
