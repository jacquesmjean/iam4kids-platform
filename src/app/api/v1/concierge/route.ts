import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDb } from "@/lib/public-db";
import { answer } from "@/site/concierge-brain";

export const dynamic = "force-dynamic";

/**
 * The website chat. Answers come from a fixed script (see concierge-brain),
 * and every turn is kept through log_concierge(), so the team can read every
 * conversation in the staff console. If logging fails, the visitor still
 * gets an answer: safety advice must never wait on a database.
 */
const Schema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
  locale: z.enum(["en", "es"]).default("en"),
  page: z.string().max(200).optional().nullable(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  const { conversationId, message, locale, page } = parsed.data;

  const a = answer(message, locale);

  const db = publicDb();
  if (db) {
    const { error } = await db.rpc("log_concierge", {
      p_conversation: conversationId,
      p_visitor: message,
      p_reply: a.reply,
      p_locale: a.locale,
      p_flag: a.flag,
      p_page: page ?? null,
    });
    if (error) console.error("[concierge] log failed:", error.message);
  }

  return NextResponse.json({ reply: a.reply, flag: a.flag });
}
