"use server";

import { redirect } from "next/navigation";
import { clearSession, passwordGrant, readClaims, storeSession, userClient } from "@/lib/auth";

export interface SignInState {
  error: string | null;
  /** Handed back so the email field survives a failed attempt (React resets forms after an action). */
  email?: string;
}

/**
 * Sign in, then confirm the account is staff before letting it through.
 * A valid login that is not on the staff list gets signed straight back out:
 * an account existing is not the same as an account being allowed in.
 */
export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const locale = form.get("locale") === "es" ? "es" : "en";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password.", email };

  const result = await passwordGrant(email, password);
  if (!result.ok) {
    if (result.error === "not-configured") {
      return { error: "Sign-in is not set up on this deployment yet.", email };
    }
    if (result.error === "network") {
      return { error: "Could not reach the sign-in service. Try again in a moment.", email };
    }
    return { error: "That email and password do not match.", email };
  }

  const { data: staff } = await userClient(result.tokens.access_token).rpc("current_staff");
  if (!staff) {
    await clearSession();
    return { error: "This account is not on the I AM 4 Kids staff list. Ask Jacques to add you.", email };
  }

  await storeSession(result.tokens);

  const mustChange = readClaims(result.tokens.access_token)?.user_metadata?.must_change_password;
  redirect(mustChange ? `/${locale}/admin/password` : `/${locale}/admin`);
}

export async function signOut(form: FormData) {
  const locale = form.get("locale") === "es" ? "es" : "en";
  await clearSession();
  redirect(`/${locale}/login`);
}
