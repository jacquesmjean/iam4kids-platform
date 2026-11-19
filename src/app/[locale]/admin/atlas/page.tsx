import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { saveAtlasEntry, setAtlasStatus } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, field, first, label, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

interface Entry {
  id: string;
  kind: string;
  title: string;
  body: string;
  evidence: string | null;
  source: string | null;
  status: "draft" | "approved" | "retired";
  approved_at: string | null;
  approver: { full_name: string } | { full_name: string }[] | null;
}

const SECTIONS = [
  { kind: "guardrail", name: "Guardrails", about: "Rules AI must never break. Yours, in your words." },
  { kind: "claim", name: "Claims", about: "Numbers and results. Each needs evidence before it can be approved." },
  { kind: "history", name: "History", about: "Your real accomplishments and milestones, with the evidence behind them." },
  { kind: "program", name: "Programs", about: "What you offer, and what it costs." },
  { kind: "message", name: "Messages", about: "Your mission and the lines you use about the work." },
  { kind: "voice", name: "Voice", about: "How you sound: sign-offs, call and response, words you use and avoid." },
  { kind: "term", name: "Terms", about: "Your named frameworks and what each one means." },
  { kind: "character", name: "Characters", about: "Your I AM 4 Kids characters." },
] as const;

const NEEDS_EVIDENCE = new Set(["claim", "history"]);

export default async function Atlas({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const sp = await searchParams;
  const staff = await requireStaff(locale);

  const { data } = await staff.db
    .from("atlas_entry")
    .select("id, kind, title, body, evidence, source, status, approved_at, approver:approved_by(full_name)")
    .order("sort")
    .order("created_at");
  const all = (data as Entry[] | null) ?? [];

  const kindParam = first(sp.kind);
  const section = SECTIONS.find((s) => s.kind === kindParam) ?? SECTIONS[0];
  const entries = all.filter((e) => e.kind === section.kind && e.status !== "retired");
  const retired = all.filter((e) => e.kind === section.kind && e.status === "retired");
  const drafts = all.filter((e) => e.status === "draft").length;

  return (
    <>
      <ScreenHeader
        title="Atlas"
        lede={
          <>
            Your standards, in one place, so anything AI drafts works from your actual material instead of guessing.
            Only <strong>approved</strong> entries are used. Numbers and history cannot be approved without evidence,
            and if an approved claim is edited it goes back to draft until you approve it again.
          </>
        }
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      {drafts > 0 && (
        <p className="mt-6 rounded-xl border border-[#f5a524]/50 bg-[#fffaf0] px-5 py-3.5 text-sm text-[#8a5a00]">
          {drafts} draft{drafts === 1 ? " is" : "s are"} waiting for you to confirm. We copied them from your own
          website and noted where each came from. Approve the ones that are right, and edit or retire the rest.
        </p>
      )}

      <nav className="mt-8 flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const live = all.filter((e) => e.kind === s.kind && e.status !== "retired");
          const pending = live.filter((e) => e.status === "draft").length;
          return (
            <Link
              key={s.kind}
              href={`/${locale}/admin/atlas?kind=${s.kind}`}
              className={
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold " +
                (s.kind === section.kind ? "bg-[#0b1b3a] text-white" : "border border-[#0b1b3a]/15 bg-white text-[#0b1b3a]")
              }
            >
              {s.name}
              <span className="text-xs opacity-70 tabular-nums">{live.length}</span>
              {pending > 0 && <span className="h-2 w-2 rounded-full bg-[#f5a524]" aria-label={`${pending} drafts`} />}
            </Link>
          );
        })}
      </nav>

      <p className="mt-6 text-[#12224a]/75">{section.about}</p>

      <div className="mt-4 space-y-4">
        {entries.length === 0 &&
          (section.kind === "character" ? (
            <Empty>
              No characters yet, on purpose. You have established characters, and we will not invent them. Add each one
              below with how they look, what they stand for, and how they speak.
            </Empty>
          ) : (
            <Empty>Nothing here yet. Add the first entry below.</Empty>
          ))}

        {entries.map((e) => {
          const approver = Array.isArray(e.approver) ? e.approver[0] : e.approver;
          return (
            <article
              key={e.id}
              id={`a-${e.id}`}
              className={
                "scroll-mt-8 rounded-2xl border bg-white p-5 shadow-sm " +
                (e.status === "draft" ? "border-[#f5a524]/50" : "border-[#0b1b3a]/10")
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <Pill tone={e.status === "approved" ? "green" : "gold"}>{e.status === "approved" ? "Approved" : "Draft"}</Pill>
                <h2 className="font-bold text-[#0b1b3a]">{e.title}</h2>
                {e.status === "approved" && e.approved_at && (
                  <span className="text-xs text-[#12224a]/55">
                    by {approver?.full_name ?? "staff"}, {formatShort(e.approved_at)}
                  </span>
                )}
                <div className="ml-auto flex gap-2">
                  {e.status === "draft" && (
                    <form action={setAtlasStatus}>
                      <Locale locale={locale} />
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="kind" value={e.kind} />
                      <input type="hidden" name="status" value="approved" />
                      <SubmitButton pending="Approving…">Approve</SubmitButton>
                    </form>
                  )}
                  {e.status === "approved" && (
                    <form action={setAtlasStatus}>
                      <Locale locale={locale} />
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="kind" value={e.kind} />
                      <input type="hidden" name="status" value="draft" />
                      <SubmitButton variant="secondary" pending="Saving…">Back to draft</SubmitButton>
                    </form>
                  )}
                  <form action={setAtlasStatus}>
                    <Locale locale={locale} />
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="kind" value={e.kind} />
                    <input type="hidden" name="status" value="retired" />
                    <SubmitButton variant="quiet" pending="Saving…">Retire</SubmitButton>
                  </form>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line leading-relaxed text-[#12224a]/90">{e.body}</p>
              {(e.evidence || NEEDS_EVIDENCE.has(e.kind)) && (
                <p className="mt-3 text-sm text-[#12224a]/60">
                  <span className="font-semibold">Evidence: </span>
                  {e.evidence ?? <span className="text-red-700">None yet. Needed before this can be approved.</span>}
                </p>
              )}

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#2563eb]">Edit</summary>
                <form action={saveAtlasEntry} className="mt-3 grid gap-3">
                  <Locale locale={locale} />
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="kind" value={e.kind} />
                  <input type="hidden" name="was_approved" value={e.status === "approved" ? "1" : "0"} />
                  <label className="block">
                    <span className={label}>Name</span>
                    <input name="title" defaultValue={e.title} required className={`mt-1 ${field}`} />
                  </label>
                  <label className="block">
                    <span className={label}>Text</span>
                    <textarea name="body" defaultValue={e.body} rows={4} required className={`mt-1 ${field}`} />
                  </label>
                  <label className="block">
                    <span className={label}>Evidence: where this comes from or how we know it</span>
                    <textarea name="evidence" defaultValue={e.evidence ?? ""} rows={2} className={`mt-1 ${field}`} />
                  </label>
                  <input type="hidden" name="source" value={e.source ?? ""} />
                  <div>
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </form>
              </details>
            </article>
          );
        })}
      </div>

      <details className="mt-6 rounded-2xl border border-dashed border-[#0b1b3a]/25 bg-white/70 p-5" open={entries.length === 0}>
        <summary className="cursor-pointer font-semibold text-[#0b1b3a]">+ Add to {section.name}</summary>
        <form action={saveAtlasEntry} className="mt-4 grid gap-3">
          <Locale locale={locale} />
          <input type="hidden" name="kind" value={section.kind} />
          <label className="block">
            <span className={label}>Name</span>
            <input name="title" required className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className={label}>Text</span>
            <textarea name="body" rows={4} required className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className={label}>
              Evidence{NEEDS_EVIDENCE.has(section.kind) ? " (needed before approval)" : " (optional)"}
            </span>
            <textarea name="evidence" rows={2} className={`mt-1 ${field}`} />
          </label>
          <div>
            <SubmitButton>Add as draft</SubmitButton>
          </div>
        </form>
      </details>

      {retired.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-[#12224a]/60">{retired.length} retired</summary>
          <ul className="mt-2 space-y-2">
            {retired.map((e) => (
              <li key={e.id} className="flex items-center gap-3 text-sm text-[#12224a]/60">
                <span className="line-through">{e.title}</span>
                <form action={setAtlasStatus}>
                  <Locale locale={locale} />
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="kind" value={e.kind} />
                  <input type="hidden" name="status" value="draft" />
                  <SubmitButton variant="quiet" pending="Saving…">Bring back as draft</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
