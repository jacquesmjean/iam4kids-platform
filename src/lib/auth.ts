import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";

/**
 * Staff sign-in, without the service role key.
 *
 * A staff member signs in with Supabase Auth. Their access token lives in
 * an httpOnly cookie, and every console query is sent with that token, so
 * row-level security in the database decides what they can see and change.
 * The app never holds a key that can read more than the person using it.
 *
 * Server-only. Never import this into a client component.
 */

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieOptions,
  readClaims,
  type TokenSet,
} from "@/lib/session-tokens";

export { passwordGrant, refreshGrant, readClaims } from "@/lib/session-tokens";

/** Write a fresh session into the cookie jar. Only callable from a Server Action or Route Handler. */
export async function storeSession(tokens: TokenSet) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.access_token, cookieOptions(tokens.expires_in));
  jar.set(REFRESH_COOKIE, tokens.refresh_token, cookieOptions(REFRESH_MAX_AGE));
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/** A database client that acts as the signed-in person. RLS applies. */
export function userClient(accessToken: string): SupabaseClient {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) throw new Error("Supabase URL and publishable key are not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export interface Staff {
  personId: string;
  fullName: string;
  email: string;
  mustChangePassword: boolean;
  db: SupabaseClient;
  accessToken: string;
}

/**
 * The signed-in staff member, or null. One database round trip, which both
 * verifies the token and confirms the staff role. Cached per request so a
 * layout and its page do not ask twice.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
  if (!supabaseUrl() || !supabaseAnonKey()) return null;

  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const db = userClient(token);
  const { data, error } = await db.rpc("current_staff");
  if (error || !data) return null;

  const me = data as { person_id: string; full_name: string; email: string };
  const claims = readClaims(token);

  return {
    personId: me.person_id,
    fullName: me.full_name,
    email: me.email,
    mustChangePassword: Boolean(claims?.user_metadata?.must_change_password),
    db,
    accessToken: token,
  };
});

/** For pages and Server Actions: the staff member, or a redirect to sign in. */
export async function requireStaff(locale: string): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect(`/${locale === "es" ? "es" : "en"}/login`);
  return staff;
}
