import { NextResponse } from "next/server";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { registerFamily } from "@/lib/events/register";

export const dynamic = "force-dynamic";

const Schema = z.object({
  guardianName: z.string().min(1).max(200),
  guardianEmail: z.string().email().max(255),
  childFirstName: z.string().min(1).max(100),
  childAge: z.number().int().min(4).max(18),
  language: z.enum(["en", "es"]).default("en"),
  guardianConsent: z.literal(true),      // the only acceptable value
  source: z.string().max(120).optional(),
  campaign: z.string().max(120).optional(),
});

/**
 * The six records one submission writes. Returned in preview mode so the flow
 * is inspectable before the database keys exist — and so nobody has to take
 * "no child account is created" on trust.
 */
function plannedWrites(input: z.infer<typeof Schema>) {
  return [
    { table: "person", note: `Guardian ${input.guardianName}, matched on email so case never duplicates` },
    { table: "household", note: "One per guardian; siblings attach to the same one" },
    { table: "role_assignment", note: "This person is a guardian in this household" },
    { table: "child_profile", note: `${input.childFirstName}, age ${input.childAge} — no email, no login, no phone` },
    { table: "consent", note: "Append-only, storing the exact wording shown at the time" },
    { table: "registration", note: "Idempotent on (session, person) — a double tap updates, never duplicates" },
  ];
}

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete every field and confirm guardian consent." },
      { status: 400 }
    );
  }

  // Keys not wired up yet. Show the work rather than throwing a 500 at a parent.
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      preview: true,
      slug,
      writes: plannedWrites(parsed.data),
      note: "Preview mode — Supabase credentials are not set on this deployment, so nothing was written.",
    });
  }

  // Next open session for this event.
  const { data: session } = await db
    .from("event_session")
    .select("id, capacity, event!inner(slug)")
    .eq("event.slug", slug)
    .eq("status", "scheduled")
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "No upcoming session for this event." }, { status: 404 });
  }

  try {
    const result = await registerFamily({ sessionId: session.id, ...parsed.data });
    return NextResponse.json({ ok: true, preview: false, writes: plannedWrites(parsed.data), ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // A failed registration is a family who will never tell us. Surface it.
    await db.from("exception_item").insert({
      area: "event",
      severity: "critical",
      summary: "Registration failed",
      detail: { slug, message },
    });

    return NextResponse.json(
      { error: "We could not complete your registration. Our team has been alerted." },
      { status: 500 }
    );
  }
}
