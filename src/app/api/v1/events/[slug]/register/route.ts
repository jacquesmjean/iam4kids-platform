import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDb } from "@/lib/public-db";

export const dynamic = "force-dynamic";

const Schema = z.object({
  guardianName: z.string().trim().min(1).max(200),
  guardianEmail: z.string().trim().email().max(255),
  childFirstName: z.string().trim().min(1).max(100),
  childAge: z.number().int().min(4).max(18),
  language: z.enum(["en", "es"]).default("en"),
  guardianConsent: z.literal(true), // the only acceptable value
  source: z.string().max(120).optional(),
  campaign: z.string().max(120).optional(),
});

/**
 * Family registration.
 *
 * Calls public.register_for_event() (migration 0011) with the publishable
 * key. That function is the only door: it validates its own input, opens
 * only the next future session, writes the six records in one transaction,
 * waitlists when a session is full, and treats a double submit as one
 * registration. It replaced a route that needed the service role key, which
 * this deployment never had, so until now every registration was a preview
 * that saved nothing.
 */
export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const i = parsed.data;

  const db = publicDb();
  if (!db) return NextResponse.json({ ok: true, preview: true });

  const { data, error } = await db.rpc("register_for_event", {
    p_slug: slug,
    p_guardian_name: i.guardianName,
    p_guardian_email: i.guardianEmail,
    p_child_first_name: i.childFirstName,
    p_child_age: i.childAge,
    p_language: i.language,
    p_consent: i.guardianConsent,
    p_source: i.source ?? "register-page",
    p_campaign: i.campaign ?? null,
  });

  if (error) {
    if (error.message.includes("no_upcoming_session")) {
      return NextResponse.json({ error: "no-session" }, { status: 409 });
    }
    if (/consent_required|invalid_/.test(error.message)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    console.error("[register] failed:", error.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  const r = data as { registration_id: string; status: string; starts_at: string; event_title: string };
  return NextResponse.json({ ok: true, preview: false, status: r.status, startsAt: r.starts_at });
}
