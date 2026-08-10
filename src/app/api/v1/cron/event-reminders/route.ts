import { NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Hourly reminder sweep (registered in vercel.json).
 *
 * Sends the 24-hour and 1-hour reminders for every scheduled session, in each
 * family's own time zone. Runs hourly rather than on a per-session timer so a
 * missed tick self-heals on the next pass instead of silently dropping a
 * reminder — a family who does not get reminded is a family who does not
 * turn up, and they never tell you why.
 *
 * Every send is recorded in `event_message`, which is also what makes this
 * safe to re-run: an already-sent reminder is skipped, not duplicated.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: "database not configured" });
  }

  const { data: sessions, error } = await db
    .from("event_session")
    .select("id, starts_at")
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .lte("starts_at", new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Dispatch lands in Week 2 alongside the Resend integration. Until then the
  // sweep reports what it would act on, so the cron is proven wired before it
  // is trusted to send.
  return NextResponse.json({
    ok: true,
    sessionsInWindow: sessions?.length ?? 0,
    dispatch: "pending Resend integration (Week 2)",
  });
}
