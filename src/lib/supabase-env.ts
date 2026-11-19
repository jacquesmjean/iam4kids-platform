/**
 * The two values every client needs. Both are public by design: the URL is
 * in every browser request and the publishable (anon) key only ever gets
 * what the row-level policies allow it.
 *
 * Note what is absent. The staff console does not use the service role key.
 * A staff member signs in, their own session token is sent with each query,
 * and the database decides what they may read or change. If this app had a
 * bug, the worst it could do is what that staff member could already do.
 */
export function supabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

export function supabaseAnonKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

export function isAuthConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}
