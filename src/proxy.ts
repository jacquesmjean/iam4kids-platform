import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieOptions,
  readClaims,
  refreshGrant,
} from "@/lib/session-tokens";

/**
 * Keeps a staff session alive while someone is working.
 *
 * Supabase access tokens last an hour. Without this, Mark would be signed
 * out halfway through editing a page. Pages cannot write cookies while they
 * render, so the renewal happens here, before the page runs: if the access
 * token is missing or within two minutes of expiry, swap the refresh token
 * for a new pair, hand the new token to the page on the request, and send
 * both back to the browser on the response.
 *
 * Refresh tokens are single use. Doing the swap in one place, once per
 * request, is what stops two parallel renders from spending the same token
 * and getting the session revoked.
 *
 * Also forwards the path, so the console layout can tell which screen it is
 * rendering (used to send a first-time sign-in to the change-password page).
 */
export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  const claims = access ? readClaims(access) : null;
  const expiresSoon = !claims || claims.exp * 1000 - Date.now() < 120_000;

  request.headers.set("x-pathname", request.nextUrl.pathname);

  if (!expiresSoon || !refresh) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  const result = await refreshGrant(refresh);

  if (!result.ok) {
    // The refresh token is spent or revoked. Clear both, so the console
    // sends the person to sign in rather than looping on a dead session.
    request.cookies.delete(ACCESS_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
    const res = NextResponse.next({ request: { headers: request.headers } });
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const { access_token, refresh_token, expires_in } = result.tokens;
  request.cookies.set(ACCESS_COOKIE, access_token);
  request.cookies.set(REFRESH_COOKIE, refresh_token);

  const res = NextResponse.next({ request: { headers: request.headers } });
  res.cookies.set(ACCESS_COOKIE, access_token, cookieOptions(expires_in));
  res.cookies.set(REFRESH_COOKIE, refresh_token, cookieOptions(REFRESH_MAX_AGE));
  return res;
}

export const config = {
  matcher: ["/:locale(en|es)/admin", "/:locale(en|es)/admin/:path*"],
};
