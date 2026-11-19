import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { addDecision, answerDecision, reopenDecision } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, field, first, label, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

interface Decision {
  id: string;
  question: string;
  context: string | null;
  status: "open" | "answered" | "withdrawn";
  answer: string | null;
  answered_at: string | null;
  needed_by: string | null;
  who: { full_name: string } | { full_name: string }[] | null;
}

function byDate(d: string | null) {
  if (!d) return null;
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function Decisions({
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
    .from("decision_request")
    .select("id, question, context, status, answer, answered_at, needed_by, who:answered_by(full_name)")
    .order("sort")
    .order("created_at");
  const all = (data as Decision[] | null) ?? [];
  const open = all.filter((d) => d.status === "open");
  const answered = all.filter((d) => d.status === "answered");

  return (
    <>
      <ScreenHeader
        title="Decisions"
        lede="Everything the team needs from you, in one list, so nothing waits on a meeting. Answer in a sentence. The team is notified the moment you do."
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <section className="mt-8">
        <h2 className="text-lg font-bold text-[#0b1b3a]">
          Open <span className="font-normal text-[#12224a]/50">({open.length})</span>
        </h2>
        <div className="mt-4 space-y-4">
          {open.length === 0 && <Empty>Nothing is waiting on you.</Empty>}
          {open.map((d) => (
            <article key={d.id} id={`d-${d.id}`} className="scroll-mt-8 rounded-2xl border border-[#f5a524]/50 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start gap-3">
                <h3 className="min-w-0 flex-1 text-lg font-semibold text-[#0b1b3a]">{d.question}</h3>
                {d.needed_by && <Pill tone="gold">Needed by {byDate(d.needed_by)}</Pill>}
              </div>
              {d.context && <p className="mt-2 leading-relaxed text-[#12224a]/75">{d.context}</p>}
              <form action={answerDecision} className="mt-4 grid gap-3">
                <Locale locale={locale} />
                <input type="hidden" name="id" value={d.id} />
                <label className="block">
                  <span className={label}>Your answer</span>
                  <textarea name="answer" rows={3} className={`mt-1 ${field}`} />
                </label>
                <div>
                  <SubmitButton pending="Recording…">Record my answer</SubmitButton>
                </div>
              </form>
            </article>
          ))}
        </div>
      </section>

      <details className="mt-6 rounded-2xl border border-dashed border-[#0b1b3a]/25 bg-white/70 p-5">
        <summary className="cursor-pointer font-semibold text-[#0b1b3a]">+ Add a question</summary>
        <form action={addDecision} className="mt-4 grid gap-3 md:grid-cols-[1fr_200px]">
          <Locale locale={locale} />
          <label className="block md:col-span-2">
            <span className={label}>Question</span>
            <input name="question" required className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className={label}>Why it matters (optional)</span>
            <input name="context" className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className={label}>Needed by (optional)</span>
            <input type="date" name="needed_by" className={`mt-1 ${field}`} />
          </label>
          <div>
            <SubmitButton>Add question</SubmitButton>
          </div>
        </form>
      </details>

      <section className="mt-12">
        <h2 className="text-lg font-bold text-[#0b1b3a]">
          Already answered <span className="font-normal text-[#12224a]/50">({answered.length})</span>
        </h2>
        <p className="mt-1 text-sm text-[#12224a]/60">
          Several of these you answered in your feedback form on October 15. They are recorded here in your words.
        </p>
        <div className="mt-4 divide-y divide-[#0b1b3a]/10 overflow-hidden rounded-2xl border border-[#0b1b3a]/10 bg-white">
          {answered.map((d) => {
            const who = Array.isArray(d.who) ? d.who[0] : d.who;
            return (
              <div key={d.id} id={`d-${d.id}`} className="scroll-mt-8 p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <Pill tone="green">Answered</Pill>
                  <h3 className="min-w-0 flex-1 font-semibold text-[#0b1b3a]">{d.question}</h3>
                  <form action={reopenDecision}>
                    <Locale locale={locale} />
                    <input type="hidden" name="id" value={d.id} />
                    <SubmitButton variant="quiet" pending="Reopening…">Reopen</SubmitButton>
                  </form>
                </div>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-[#12224a]/85">{d.answer}</p>
                {d.context && <p className="mt-2 text-sm text-[#12224a]/55">{d.context}</p>}
                {d.answered_at && (
                  <p className="mt-2 text-xs text-[#12224a]/50">
                    {who?.full_name ?? "Answered"}, {formatShort(d.answered_at)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
