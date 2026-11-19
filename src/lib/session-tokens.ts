import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";

/**
 * Session token helpers with no Next.js request APIs in them, so both the
 * proxy (src/proxy.ts) and server code can share them.
 */

export const ACCESS_COOKIE = "iam4k_at";
export const REFRESH_COOKIE = "iam4k_rt";

/** Refresh tokens last weeks; the access token is short and gets renewed by src/proxy.ts. */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export interface TokenSet {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

type AuthResult = { ok: true; tokens: TokenSet } | { ok: false; error: string };

async function tokenGrant(grant: "password" | "refresh_token", body: object): Promise<AuthResult> {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return { ok: false, error: "not-configured" };

  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=${grant}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok || !json.access_token) {
      return { ok: false, error: json.error_code ?? json.error ?? "auth-failed" };
    }
    return { ok: true, tokens: json as TokenSet };
  } catch {
    return { ok: false, error: "network" };
  }
}

export const passwordGrant = (email: string, password: string) =>
  tokenGrant("password", { email, password });

export const refreshGrant = (refreshToken: string) =>
  tokenGrant("refresh_token", { refresh_token: refreshToken });

export interface Claims {
  sub: string;
  email?: string;
  exp: number;
  user_metadata?: { name?: string; must_change_password?: boolean };
}

/**
 * Read the token's claims without verifying the signature. That is safe here
 * because nothing is trusted on the strength of it: every query still goes to
 * the database with the token, and the database verifies it. This is used for
 * timing (when to refresh) and for a UI flag (must change password).
 */
export function readClaims(token: string): Claims | null {
  try {
    const part = token.split(".")[1];
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json) as Claims;
  } catch {
    return null;
  }
}

