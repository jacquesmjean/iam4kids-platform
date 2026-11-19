import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { CopyButton } from "@/components/CopyButton";
import { SubmitButton } from "@/components/SubmitButton";
import { editDraft, reviewDraft } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, field, first, label, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

interface Approval {
  decision: string;
  note: string | null;
  decided_at: string;
  reviewer: { full_name: string } | { full_name: string }[] | null;
}

interface Draft {
  id: string;
  channel: string;
  label: string | null;
  body: string;
  status: string;
  approval: Approval[];
}

interface Asset {
  id: string;
  title: string;
  kind: string;
  body: string | null;
  storage_path: string | null;
  provenance: string | null;
  created_at: string;
  content_derivative: Draft[];
}

const CHANNEL = {
  linkedin: { name: "LinkedIn", color: "#0a66c2", limit: 3000 },
  facebook: { name: "Facebook", color: "#1877f2", limit: 63206 },
} as Record<string, { name: string; color: string; limit: number }>;

const STATUS: Record<string, { label: string; tone: "gold" | "green" | "grey" | "blue" }> = {
  in_review: { label: "Waiting for you", tone: "gold" },
  draft: { label: "Sent back", tone: "blue" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "grey" },
};

export default async function ContentReview({
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
    .from("content_asset")
    .select(
      "id, title, kind, body, storage_path, provenance, created_at, content_derivative(id, channel, label, body, status, approval(decision, note, decided_at, reviewer:reviewer_id(full_name)))"
    )
    .order("created_at", { ascending: false });
  const assets = (data as Asset[] | null) ?? [];

  return (
    <>
      <ScreenHeader
        title="Content"
        lede={
          <>
            Drafts for Facebook and LinkedIn, made from your own material. Nothing is posted until you approve it,
            and every decision is kept with your name. Once approved, copy the text and post it; automatic posting
            comes later. Every draft is held to your{" "}
            <Link href={`/${locale}/admin/atlas?kind=guardrail`} className="font-semibold text-[#2563eb] hover:underline">
              guardrails in Atlas
            </Link>
            .
          </>
        }
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <div className="mt-8 space-y-10">
        {assets.length === 0 && <Empty>No source material yet.</Empty>}
        {assets.map((a) => {
          const drafts = [...a.content_derivative].sort((x, y) => (x.label ?? "").localeCompare(y.label ?? ""));
          return (
            <section key={a.id} className="overflow-hidden rounded-2xl border border-[#0b1b3a]/10 bg-white shadow-sm">
              <header className="border-b border-[#0b1b3a]/10 bg-[#0b1b3a] px-6 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f5a524]">Source</p>
                <h2 className="mt-1 text-xl font-bold">{a.title}</h2>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/70">
                  {a.storage_path && (
                    <a href={a.storage_path} target="_blank" rel="noopener" className="font-semibold text-white underline-offset-4 hover:underline">
                      Watch the original ↗
                    </a>
                  )}
                  <span>Added {formatShort(a.created_at)}</span>
                </div>
                {a.provenance && (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">{a.provenance}</p>
                )}
              </header>

              <div className="divide-y divide-[#0b1b3a]/10">
                {drafts.map((d) => {
                  const ch = CHANNEL[d.channel] ?? { name: d.channel, color: "#12224a", limit: 0 };
                  const st = STATUS[d.status] ?? { label: d.status, tone: "grey" as const };
                  const history = [...(d.approval ?? [])].sort((x, y) => y.decided_at.localeCompare(x.decided_at));
                  return (
                    <article key={d.id} id={`c-${d.id}`} className="scroll-mt-8 grid gap-6 px-6 py-6 lg:grid-cols-[1fr_300px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ch.color }} />
                          <h3 className="font-bold text-[#0b1b3a]">{d.label ?? ch.name}</h3>
                          <Pill tone={st.tone}>{st.label}</Pill>
                          <span className="text-xs tabular-nums text-[#12224a]/45">{d.body.length} characters</span>
                        </div>
                        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-[#0b1b3a]/10 bg-[#fbfaf7] p-5 text-[15px] leading-relaxed text-[#12224a]">
                          {d.body}
                        </div>
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-semibold text-[#2563eb]">Edit the wording</summary>
                          <form action={editDraft} className="mt-3 space-y-3">
                            <Locale locale={locale} />
                            <input type="hidden" name="id" value={d.id} />
                            <textarea name="body" defaultValue={d.body} rows={12} className={`${field} leading-relaxed`} />
                            <SubmitButton variant="secondary">Save wording</SubmitButton>
                          </form>
                        </details>
                      </div>

                      <aside className="space-y-4">
                        {d.status === "approved" ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-sm font-semibold text-emerald-900">Ready to post on {ch.name}.</p>
                            <div className="mt-3">
                              <CopyButton text={d.body} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <form action={reviewDraft}>
                              <Locale locale={locale} />
                              <input type="hidden" name="id" value={d.id} />
                              <input type="hidden" name="decision" value="approved" />
                              <SubmitButton className="w-full" pending="Approving…">Approve</SubmitButton>
                            </form>
                            <form action={reviewDraft} className="space-y-2 rounded-xl border border-[#0b1b3a]/10 p-3">
                              <Locale locale={locale} />
                              <input type="hidden" name="id" value={d.id} />
                              <input type="hidden" name="decision" value="changes_requested" />
                              <label className="block">
                                <span className={label}>What should change?</span>
                                <textarea name="note" rows={2} className={`mt-1 ${field}`} />
                              </label>
                              <SubmitButton variant="secondary" className="w-full" pending="Sending…">Send back</SubmitButton>
                            </form>
                            <form action={reviewDraft}>
                              <Locale locale={locale} />
                              <input type="hidden" name="id" value={d.id} />
                              <input type="hidden" name="decision" value="rejected" />
                              <SubmitButton variant="quiet" className="w-full" pending="Saving…">Reject</SubmitButton>
                            </form>
                          </div>
                        )}

                        {history.length > 0 && (
                          <div>
                            <p className={label}>Decisions</p>
                            <ul className="mt-2 space-y-2 text-sm">
                              {history.map((h, i) => {
                                const who = Array.isArray(h.reviewer) ? h.reviewer[0] : h.reviewer;
                                const word = h.decision === "approved" ? "Approved" : h.decision === "rejected" ? "Rejected" : "Sent back";
                                return (
                                  <li key={i} className="text-[#12224a]/75">
                                    <span className="font-semibold text-[#0b1b3a]">{word}</span> by {who?.full_name ?? "staff"},{" "}
                                    {formatShort(h.decided_at)}
                                    {h.note && <span className="block text-[#12224a]/60">"{h.note}"</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </aside>
                    </article>
                  );
                })}
              </div>

              {a.body && (
                <details className="border-t border-[#0b1b3a]/10 px-6 py-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#0b1b3a]">Read the full transcript</summary>
                  <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[#12224a]/80">{a.body}</p>
                </details>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
