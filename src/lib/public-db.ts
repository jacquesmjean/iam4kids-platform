import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only client for figures that are safe to publish.
 *
 * The impact dashboard needs totals, not people, so it must not require the
 * service-role key. It calls `public.impact_counts()`, a security-definer
 * function that returns integers and nothing else — which means the anon key
 * is enough, and the key that can read every child record stays out of the
 * page entirely.
 *
 * Prefers the service-role key when one is present (server rendering, no
 * behaviour change) and falls back to the anon key. Returns null when neither
 * exists, so the caller can say "unavailable" instead of inventing a zero.
 */
let cached: SupabaseClient | null = null;

export function publicDb(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export interface ImpactCounts {
  families: number;
  children: number;
  guardians: number;
  schools: number;
  sessions_held: number;
  sessions_upcoming: number;
  registrations: number;
  attended: number;
  no_shows: number;
  consents: number;
  content_assets: number;
  published: number;
  awaiting_approval: number;
  open_exceptions: number;
}

export async function getImpactCounts(): Promise<ImpactCounts | null> {
  const db = publicDb();
  if (!db) return null;

  const { data, error } = await db.rpc("impact_counts");
  if (error || !data) return null;

  return data as ImpactCounts;
}
