import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDb } from "@/lib/public-db";
import { alertStaff } from "@/lib/alert";

export const dynamic = "force-dynamic";

/**
 * The Get Started form. One call to submit_inquiry(): schools land in the
 * School inquiries screen, everyone else in Families & partners. A database
 * trigger raises the console notification either way, so the alert does
 * not depend on email being set up.
 */
const Schema = z.object({
  type: z.enum(["parent", "school", "agency", "other"]),
  interest: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  org: z.string().trim().max(300).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
  language: z.enum(["en", "es"]).default("en"),
  website: z.string().optional().nullable(), // honeypot
  source: z.string().max(120).optional().nullable(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please add your name and a valid email." }, { status: 400 });
  const i = parsed.data;

  if ((i.website ?? "").trim()) return NextResponse.json({ ok: true });

  const db = publicDb();
  if (!db) return NextResponse.json({ ok: false, reason: "no-database" }, { status: 503 });

  const { data, error } = await db.rpc("submit_inquiry", {
    p_kind: i.type,
    p_interest: i.interest ?? null,
    p_name: i.name,
    p_email: i.email,
    p_phone: i.phone ?? null,
    p_org: i.org ?? null,
    p_message: i.message ?? null,
    p_locale: i.language,
    p_source: i.source ?? "get-started",
  });
  if (error) {
    console.error("[inquiry] submit failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  await alertStaff(
    data === "school" ? `School inquiry: ${i.org ?? i.name}` : `New inquiry: ${i.name}`,
    [i.name, i.email, i.phone ?? "", i.org ?? "", i.interest ?? "", i.message ?? ""].filter(Boolean),
    data === "school" ? "/admin/schools" : "/admin/inquiries",
    new URL(request.url).origin
  );

  return NextResponse.json({ ok: true, routed: data });
}
