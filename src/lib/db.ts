import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the service role key, so it bypasses RLS — every route that imports
 * this is responsible for its own authorisation. Never import this into a
 * client component. Browser-side reads use the anon key and go through the
 * policies in supabase/migrations/0004_rls.sql.
 */
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
