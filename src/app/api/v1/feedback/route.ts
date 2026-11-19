import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDb } from "@/lib/public-db";
import { alertStaff } from "@/lib/alert";

export const dynamic = "force-dynamic";

/**
 * Client feedback intake.
 *
 * Uses the publishable key rather than the service role. `client_feedback`
 * has an insert-only policy for anon, so a form submission works without
 * handing this route the key that can read a child record. It also means
 * the form works before the service-role key is wired up — and a feedback
 * form that silently discards the first submission is worse than no form.
 */
const Schema = z.object({
  authorName: z.string().min(1).max(200),
  authorRole: z.string().max(200).optional().nullable(),
  visionServes: z.string().max(5000).optional().nullable(),
  visionMissing: z.string().max(5000).optional().nullable(),
  websiteLikes: z.string().max(5000).optional().nullable(),
  websiteChanges: z.string().max(5000).optional().nullable(),
  platformLikes: z.string().max(5000).optional().nullable(),
  platformChanges: z.string().max(5000).optional().nullable(),
  hopes: z.string().max(5000).optional().nullable(),
  goLiveDate: z.string().max(20).optional().nullable(),
  goLiveDriver: z.string().max(2000).optional().nullable(),
  priority: z
    .enum(["events", "content", "schools", "impact", "public_site", "not_sure"])
    .optional()
    .nullable(),
  approver: z.string().max(500).optional().nullable(),
  guardrails: z.string().max(5000).optional().nullable(),
  channels: z.string().max(500).optional().nullable(),
  anythingElse: z.string().max(5000).optional().nullable(),
  locale: z.enum(["en", "es"]).default("en"),
  source: z.string().max(120).optional().nullable(),
});

/** Empty string is not a date. Postgres would rather be told null. */
const nz = (v: string | null | undefined) => {
  const s = (v ?? "").trim();
  return s.length ? s : null;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  }
  const i = parsed.data;

  const db = publicDb();
  if (!db) {
    // No database on this deployment. Say so plainly and let the page keep a
    // copy on screen, rather than showing a thank-you for something we threw away.
    return NextResponse.json({ ok: false, saved: false, reason: "no-database" }, { status: 503 });
  }

  const { error } = await db.from("client_feedback").insert({
    author_name: i.authorName.trim(),
    author_role: nz(i.authorRole),
    vision_serves: nz(i.visionServes),
    vision_missing: nz(i.visionMissing),
    website_likes: nz(i.websiteLikes),
    website_changes: nz(i.websiteChanges),
    platform_likes: nz(i.platformLikes),
    platform_changes: nz(i.platformChanges),
    hopes: nz(i.hopes),
    go_live_date: nz(i.goLiveDate),
    go_live_driver: nz(i.goLiveDriver),
    priority: i.priority ?? null,
    approver: nz(i.approver),
    guardrails: nz(i.guardrails),
    channels: nz(i.channels),
    anything_else: nz(i.anythingElse),
    locale: i.locale,
    source: nz(i.source) ?? "feedback-form",
  });

  if (error) {
    return NextResponse.json(
      { ok: false, saved: false, reason: error.message },
      { status: 500 }
    );
  }

  // The database trigger has already raised a console notification. Email is
  // the second channel, sent only if the deployment has a Resend key. Mark's
  // October feedback sat unread for five weeks because neither existed.
  await alertStaff(
    `New feedback from ${i.authorName.trim()}`,
    [
      nz(i.anythingElse) ?? nz(i.hopes) ?? nz(i.visionServes) ?? "Open the console to read it.",
    ],
    "/admin/feedback",
    new URL(request.url).origin
  );

  return NextResponse.json({ ok: true, saved: true });
}
