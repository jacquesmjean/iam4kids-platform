import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDb } from "@/lib/public-db";
import { alertStaff } from "@/lib/alert";

export const dynamic = "force-dynamic";

/**
 * School inquiry intake, the principals' front door.
 *
 * Same posture as client feedback: written with the publishable key into a
 * table that the public may insert into and only staff may read. A database
 * trigger raises the staff notification, so the alert does not depend on
 * this route finishing, or on email being configured.
 */
const Schema = z.object({
  contactName: z.string().trim().min(1).max(200),
  contactTitle: z.string().trim().max(200).optional().nullable(),
  schoolName: z.string().trim().min(1).max(300),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  studentCount: z.number().int().min(0).max(100000).optional().nullable(),
  interest: z.enum(["program_only", "program_live_launch", "masterclass", "not_sure"]).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
  locale: z.enum(["en", "es"]).default("en"),
  source: z.string().trim().max(120).optional().nullable(),
  website: z.string().optional().nullable(), // honeypot
});

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
    return NextResponse.json({ error: "Please add your name, school and a valid email." }, { status: 400 });
  }
  const i = parsed.data;

  // A filled honeypot is a bot. Tell it everything went fine and keep nothing.
  if (nz(i.website)) return NextResponse.json({ ok: true });

  const db = publicDb();
  if (!db) return NextResponse.json({ ok: false, reason: "no-database" }, { status: 503 });

  const { error } = await db.from("school_inquiry").insert({
    contact_name: i.contactName,
    contact_title: nz(i.contactTitle),
    school_name: i.schoolName,
    email: i.email.toLowerCase(),
    phone: nz(i.phone),
    student_count: i.studentCount ?? null,
    interest: i.interest ?? null,
    message: nz(i.message),
    locale: i.locale,
    source: nz(i.source) ?? "schools-page",
  });

  if (error) {
    console.error("[schools] inquiry insert failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  await alertStaff(
    `School inquiry: ${i.schoolName}`,
    [
      `${i.contactName}${i.contactTitle ? `, ${i.contactTitle}` : ""}`,
      i.schoolName,
      i.email,
      i.phone ?? "",
      i.studentCount ? `${i.studentCount} students` : "",
      i.message ?? "",
    ].filter(Boolean),
    "/admin/schools",
    new URL(request.url).origin
  );

  return NextResponse.json({ ok: true });
}
