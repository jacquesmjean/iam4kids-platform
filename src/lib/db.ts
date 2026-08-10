import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the service role key, so it bypasses RLS — every route that imports
 * this is responsible for its own authorisation. Never import this into a
 * client component. Browser-side reads use the anon key and go through the
 * policies in supabase/migrations/0004_rls.sql.
 *
 * Constructed lazily. `createClient` throws when the URL is missing, and a
 * module-level call would make that throw happen during `next build` — a
 * missing environment variable would fail the deploy instead of failing the
 * one request that actually needed the database. The proxy below defers
 * construction to first use, so the site still builds and renders while the
 * keys are being wired up.
 */
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY (see .env.example and docs/ACCESS-CHECKLIST.md)."
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/** True when the database is wired up. Lets a page degrade instead of crash. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const db = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
