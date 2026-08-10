import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
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
    return NextResponse.json({ ok: true, ...result });
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
