"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { refreshGrant, requireStaff, storeSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { REFRESH_COOKIE } from "@/lib/session-tokens";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { DEFAULT_ZONE, ZONES, zonedToUtc } from "@/lib/time";

/**
 * Every change made from the staff console.
 *
 * Each action re-checks that the caller is staff, then writes as that person.
 * The database policies make the final call, and the triggers stamp who made
 * each change, so none of these can do more than the signed-in person could
 * already do by hand.
 *
 * Outcomes travel back as ?ok= / ?error= on the page URL, so a confirmation
 * survives the redirect and nothing needs client state.
 */

const loc = (form: FormData) => (form.get("locale") === "es" ? "es" : "en");
const str = (form: FormData, k: string) => String(form.get(k) ?? "").trim();
const opt = (form: FormData, k: string) => {
  const v = str(form, k);
  return v.length ? v : null;
};

function back(locale: string, path: string, outcome: { ok?: string; error?: string }, hash = ""): never {
  revalidatePath(`/${locale}/admin`, "layout");
  // `path` may already carry a query (?page=, ?kind=, ?key=); merge, never append a second "?".
  const [pathname, existing = ""] = path.split("?");
  const q = new URLSearchParams(existing);
  if (outcome.ok) q.set("ok", outcome.ok);
  if (outcome.error) q.set("error", outcome.error);
  const qs = q.toString();
  redirect(`/${locale}/admin${pathname}${qs ? `?${qs}` : ""}${hash}`);
}

/** Postgres refusals, in words a non-engineer can act on. */
function explain(message: string | undefined): string {
  const m = message ?? "";
  if (m.includes("atlas_claims_need_evidence")) {
    return "A claim or piece of history needs evidence before it can be approved. Add where it comes from, then approve.";
  }
  if (m.includes("permission denied") || m.includes("row-level security")) {
    return "Your account is not allowed to make that change.";
  }
  if (m.includes("duplicate key")) return "Something with that name already exists.";
  if (m.includes("check constraint")) return "One of the values is outside what this field accepts.";
  return "That did not save. Try once more, and tell Jacques if it keeps happening.";
}

// ---------------------------------------------------------------- notifications

export async function markAllNotificationsRead(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  await staff.db
    .from("staff_notification")
    .update({ read_at: new Date().toISOString(), read_by: staff.personId })
    .is("read_at", null);
  back(locale, "", { ok: "Notifications cleared." });
}

// ---------------------------------------------------------------- feedback

export async function setFeedbackRead(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const read = form.get("read") === "1";

  const { error } = await staff.db
    .from("client_feedback")
    .update(read ? { read_at: new Date().toISOString(), read_by: staff.personId } : { read_at: null, read_by: null })
    .eq("id", id);
  if (error) back(locale, "/feedback", { error: explain(error.message) });

  if (read) {
    await staff.db
      .from("staff_notification")
      .update({ read_at: new Date().toISOString(), read_by: staff.personId })
      .eq("subject_table", "client_feedback")
      .eq("subject_id", id)
      .is("read_at", null);
  }
  back(locale, "/feedback", { ok: read ? "Marked as read." : "Marked as unread." }, `#f-${id}`);
}

// ---------------------------------------------------------------- school inquiries

const INQUIRY_STATUSES = ["new", "contacted", "in_conversation", "won", "closed"];

export async function updateSchoolInquiry(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const status = str(form, "status");
  if (!INQUIRY_STATUSES.includes(status)) back(locale, "/schools", { error: "Pick a status from the list." });

  const { error } = await staff.db
    .from("school_inquiry")
    .update({ status, staff_note: opt(form, "staff_note") })
    .eq("id", id);
  if (error) back(locale, "/schools", { error: explain(error.message) });

  await staff.db
    .from("staff_notification")
    .update({ read_at: new Date().toISOString(), read_by: staff.personId })
    .eq("subject_table", "school_inquiry")
    .eq("subject_id", id)
    .is("read_at", null);

  back(locale, "/schools", { ok: "Inquiry updated." }, `#s-${id}`);
}

// ---------------------------------------------------------------- page wording

/**
 * The editor posts every field on the page; only the ones that changed are
 * written, so the revision history records real edits and not a save click.
 * Field names: v::<key>::<locale> for the new value, o::<key>::<locale> for
 * the value the editor was opened with.
 */
export async function saveBlocks(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const page = str(form, "page") || "schools";

  const changes: { key: string; locale: string; value: string }[] = [];
  for (const [name, raw] of form.entries()) {
    if (!name.startsWith("v::")) continue;
    const [, key, lang] = name.split("::");
    const value = String(raw).replace(/\r\n/g, "\n").trim();
    const original = String(form.get(`o::${key}::${lang}`) ?? "").replace(/\r\n/g, "\n").trim();
    if (value !== original) changes.push({ key, locale: lang, value });
  }

  if (changes.length === 0) back(locale, `/site?page=${page}`, { ok: "Nothing had changed." });

  for (const c of changes) {
    const { error } = await staff.db
      .from("site_block")
      .update({ value: c.value })
      .eq("key", c.key)
      .eq("locale", c.locale);
    if (error) back(locale, `/site?page=${page}`, { error: explain(error.message) });
  }

  revalidatePath(`/en/${page}`);
  revalidatePath(`/es/${page}`);
  back(locale, `/site?page=${page}`, {
    ok: `Saved ${changes.length} change${changes.length === 1 ? "" : "s"}. The page is live now.`,
  });
}

export async function restoreBlock(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const key = str(form, "key");
  const lang = str(form, "lang");
  const value = String(form.get("value") ?? "");

  const { data: block, error } = await staff.db
    .from("site_block")
    .update({ value })
    .eq("key", key)
    .eq("locale", lang)
    .select("page")
    .single();
  if (error) back(locale, `/site/history?key=${encodeURIComponent(key)}`, { error: explain(error.message) });

  revalidatePath(`/en/${block?.page ?? "schools"}`);
  revalidatePath(`/es/${block?.page ?? "schools"}`);
  back(locale, `/site/history?key=${encodeURIComponent(key)}`, { ok: "Restored. The page shows this version now." });
}

// ---------------------------------------------------------------- events

const KINDS = [
  "family_reset", "educator_masterclass", "before_the_bell", "family_pack", "academy",
  "assembly", "professional_development", "webinar", "media", "community",
];
const AUDIENCES = ["families", "schools", "educators", "mixed"];
const SESSION_STATUSES = ["draft", "scheduled", "live", "completed", "cancelled"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveEvent(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = opt(form, "id");
  const title = str(form, "title");
  const kind = str(form, "kind");
  const audience = str(form, "audience");
  const isFree = form.get("is_free") === "on";
  const price = Number(str(form, "price"));

  if (!title) back(locale, "/events", { error: "Give the event a name." });
  if (!KINDS.includes(kind)) back(locale, "/events", { error: "Pick what kind of event this is." });
  if (!AUDIENCES.includes(audience)) back(locale, "/events", { error: "Pick who the event is for." });
  if (!isFree && !(price > 0)) back(locale, "/events", { error: "A paid event needs a price, or tick Free." });

  const row = {
    title,
    kind,
    audience,
    description: opt(form, "description"),
    is_free: isFree,
    price_cents: isFree ? null : Math.round(price * 100),
  };

  if (id) {
    const { error } = await staff.db.from("event").update(row).eq("id", id);
    if (error) back(locale, "/events", { error: explain(error.message) }, `#e-${id}`);
    back(locale, "/events", { ok: "Event saved." }, `#e-${id}`);
  }

  // New event: the web address comes from the name, made unique if needed.
  const base = slugify(title) || "event";
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { data } = await staff.db.from("event").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }
  const { data: created, error } = await staff.db.from("event").insert({ ...row, slug }).select("id").single();
  if (error) back(locale, "/events", { error: explain(error.message) });
  back(locale, "/events", { ok: "Event created. Now add its first date." }, `#e-${created?.id}`);
}

function sessionFields(form: FormData, locale: string, anchor: string) {
  const zone = ZONES.some((z) => z.id === str(form, "zone")) ? str(form, "zone") : DEFAULT_ZONE;
  const startsAt = zonedToUtc(str(form, "date"), str(form, "time"), zone);
  if (!startsAt) back(locale, "/events", { error: "Enter a date and a start time." }, anchor);

  const duration = Number(str(form, "duration") || 60);
  const capacityRaw = str(form, "capacity");
  const capacity = capacityRaw === "" ? null : Number(capacityRaw);
  const status = str(form, "status") || "scheduled";
  const joinUrl = opt(form, "join_url");

  if (!(duration >= 15 && duration <= 600)) back(locale, "/events", { error: "Length must be between 15 and 600 minutes." }, anchor);
  if (capacity !== null && !(capacity >= 1 && capacity <= 100000)) back(locale, "/events", { error: "Seats must be a number, or left empty for no limit." }, anchor);
  if (!SESSION_STATUSES.includes(status)) back(locale, "/events", { error: "Pick a status from the list." }, anchor);
  if (joinUrl && !/^https:\/\//i.test(joinUrl)) back(locale, "/events", { error: "The join link must start with https://" }, anchor);

  return {
    starts_at: startsAt!.toISOString(),
    duration_mins: duration,
    capacity,
    status,
    join_url: joinUrl,
    delivery: (str(form, "delivery") || "zoom") as "zoom" | "in_person" | "other",
  };
}

export async function addSession(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const eventId = str(form, "event_id");
  const anchor = `#e-${eventId}`;
  const fields = sessionFields(form, locale, anchor);

  if (new Date(fields.starts_at).getTime() < Date.now()) {
    back(locale, "/events", { error: "That date and time has already passed." }, anchor);
  }

  const { error } = await staff.db.from("event_session").insert({ event_id: eventId, ...fields });
  if (error) back(locale, "/events", { error: explain(error.message) }, anchor);
  revalidatePath(`/${locale}/register`);
  back(locale, "/events", { ok: "Date added. Registration is open for it now." }, anchor);
}

export async function updateSession(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const anchor = `#e-${str(form, "event_id")}`;
  const fields = sessionFields(form, locale, anchor);

  const { error } = await staff.db.from("event_session").update(fields).eq("id", id);
  if (error) back(locale, "/events", { error: explain(error.message) }, anchor);
  revalidatePath(`/${locale}/register`);
  back(locale, "/events", { ok: "Date updated." }, anchor);
}

// ---------------------------------------------------------------- Atlas

const ATLAS_KINDS = ["guardrail", "voice", "claim", "history", "program", "character", "message", "term"];
const ATLAS_STATUSES = ["draft", "approved", "retired"];

export async function saveAtlasEntry(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = opt(form, "id");
  const kind = str(form, "kind");
  const tab = `/atlas?kind=${kind}`;

  if (!ATLAS_KINDS.includes(kind)) back(locale, "/atlas", { error: "Pick a section." });
  const title = str(form, "title");
  const body = str(form, "body");
  if (!title || !body) back(locale, tab, { error: "An entry needs a name and the text itself." });

  const row = {
    kind,
    title,
    body,
    evidence: opt(form, "evidence"),
    source: opt(form, "source"),
  };

  if (id) {
    const { data, error } = await staff.db.from("atlas_entry").update(row).eq("id", id).select("status").single();
    if (error) back(locale, tab, { error: explain(error.message) }, `#a-${id}`);
    const msg =
      data?.status === "draft" && form.get("was_approved") === "1"
        ? "Saved. Because a claim changed, it went back to draft. Approve it again when it is right."
        : "Saved.";
    back(locale, tab, { ok: msg }, `#a-${id}`);
  }

  const { data, error } = await staff.db.from("atlas_entry").insert({ ...row, status: "draft" }).select("id").single();
  if (error) back(locale, tab, { error: explain(error.message) });
  back(locale, tab, { ok: "Added as a draft. Approve it when it is right." }, `#a-${data?.id}`);
}

export async function setAtlasStatus(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const status = str(form, "status");
  const kind = str(form, "kind");
  if (!ATLAS_STATUSES.includes(status)) back(locale, `/atlas?kind=${kind}`, { error: "Unknown status." });

  const { error } = await staff.db.from("atlas_entry").update({ status }).eq("id", id);
  if (error) back(locale, `/atlas?kind=${kind}`, { error: explain(error.message) }, `#a-${id}`);
  const words = { approved: "Approved. The content system may use it now.", draft: "Moved back to draft.", retired: "Retired. It stays on record but is no longer used." };
  back(locale, `/atlas?kind=${kind}`, { ok: words[status as keyof typeof words] }, `#a-${id}`);
}

// ---------------------------------------------------------------- decisions

export async function answerDecision(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const answer = str(form, "answer");
  if (!answer) back(locale, "/decisions", { error: "Write your answer first. A sentence is plenty." }, `#d-${id}`);

  const { error } = await staff.db.from("decision_request").update({ status: "answered", answer }).eq("id", id);
  if (error) back(locale, "/decisions", { error: explain(error.message) }, `#d-${id}`);
  back(locale, "/decisions", { ok: "Answer recorded. The team has been notified." });
}

export async function reopenDecision(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const { error } = await staff.db.from("decision_request").update({ status: "open" }).eq("id", id);
  if (error) back(locale, "/decisions", { error: explain(error.message) });
  back(locale, "/decisions", { ok: "Reopened." }, `#d-${id}`);
}

export async function addDecision(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const question = str(form, "question");
  if (!question) back(locale, "/decisions", { error: "Write the question." });

  const { error } = await staff.db.from("decision_request").insert({
    question,
    context: opt(form, "context"),
    needed_by: opt(form, "needed_by"),
    status: "open",
    sort: 5,
  });
  if (error) back(locale, "/decisions", { error: explain(error.message) });
  back(locale, "/decisions", { ok: "Question added." });
}

// ---------------------------------------------------------------- password

export async function changePassword(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (password.length < 10) back(locale, "/password", { error: "Use at least 10 characters." });
  if (password !== confirm) back(locale, "/password", { error: "The two passwords do not match." });

  const res = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabaseAnonKey() ?? "",
      Authorization: `Bearer ${staff.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, data: { must_change_password: false } }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const weak = String(body.error_code ?? body.msg ?? "").includes("weak") || String(body.msg ?? "").toLowerCase().includes("pwned");
    back(locale, "/password", {
      error: weak
        ? "That password is too common or has appeared in a data breach. Choose another."
        : "That did not save. Try again.",
    });
  }

  // The current token still carries the old "must change password" flag.
  // Swap it for a fresh one so the console stops asking.
  const rt = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (rt) {
    const fresh = await refreshGrant(rt);
    if (fresh.ok) await storeSession(fresh.tokens);
  }
  back(locale, "", { ok: "Password changed. From now on, sign in with the new one." });
}

// ---------------------------------------------------------------- content review

const DECISIONS = ["approved", "rejected", "changes_requested"] as const;

/**
 * Approve, reject or send back a draft. The decision is its own row in
 * `approval`, with the reviewer and the moment, never inferred later from a
 * status field. That record is what "nothing published without approval"
 * rests on.
 */
export async function reviewDraft(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const decision = str(form, "decision") as (typeof DECISIONS)[number];
  if (!DECISIONS.includes(decision)) back(locale, "/content", { error: "Unknown decision." });
  const note = opt(form, "note");
  if (decision === "changes_requested" && !note) {
    back(locale, "/content", { error: "Say what should change, so the next draft gets it right." }, `#c-${id}`);
  }

  const { error: aErr } = await staff.db
    .from("approval")
    .insert({ derivative_id: id, reviewer_id: staff.personId, decision, note });
  if (aErr) back(locale, "/content", { error: explain(aErr.message) }, `#c-${id}`);

  const status = decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : "draft";
  const { error } = await staff.db.from("content_derivative").update({ status }).eq("id", id);
  if (error) back(locale, "/content", { error: explain(error.message) }, `#c-${id}`);

  const words = {
    approved: "Approved. Copy it and post it.",
    rejected: "Rejected. It will not be used.",
    changes_requested: "Sent back with your note.",
  };
  back(locale, "/content", { ok: words[decision] }, `#c-${id}`);
}

/** Mark edits the wording himself. His edit goes back to review, so it is approved as it now reads. */
export async function editDraft(form: FormData) {
  const locale = loc(form);
  const staff = await requireStaff(locale);
  const id = str(form, "id");
  const body = String(form.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  if (!body) back(locale, "/content", { error: "The draft cannot be empty." }, `#c-${id}`);

  const { error } = await staff.db
    .from("content_derivative")
    .update({ body, status: "in_review", generated_by: "human" })
    .eq("id", id);
  if (error) back(locale, "/content", { error: explain(error.message) }, `#c-${id}`);
  back(locale, "/content", { ok: "Saved. Approve it when it reads right." }, `#c-${id}`);
}
