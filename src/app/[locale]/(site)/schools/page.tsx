import type { Metadata } from "next";
import { getBlocks, paragraphs } from "@/lib/blocks";
import { publicDb } from "@/lib/public-db";
import { formatWhen } from "@/lib/time";
import SchoolsEn from "@/site/pages/schools.en";
import SchoolsEs from "@/site/pages/schools.es";

/**
 * The page Mark sends school leaders to.
 *
 * The design comes from the I AM 4 Kids site; the wording comes from the
 * site_block table, which Mark edits himself in the staff console (Page
 * editor). It was seeded from his own iam4kids.com/schools page.
 *
 * ?from=masterclass tags the inquiry and preselects "I attended the
 * Masterclass", so the 10 December QR code can be measured on its own.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bring I AM 4 Kids to your school",
  description:
    "The I AM 4 Kids School Experience helps students build confidence, character, and leadership alongside academics.",
};

const UI = {
  en: { upcoming: "Upcoming for school leaders" },
  es: { upcoming: "Próximamente para líderes escolares" },
} as const;

interface UpcomingRow {
  id: string;
  starts_at: string;
  event: { title: string; description: string | null } | { title: string; description: string | null }[] | null;
}

async function upcomingForSchools() {
  const db = publicDb();
  if (!db) return [];
  const { data } = await db
    .from("event_session")
    .select("id, starts_at, event!inner(title, description, audience)")
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .in("event.audience", ["schools", "educators"])
    .order("starts_at")
    .limit(3);
  return ((data as UpcomingRow[] | null) ?? []).map((r) => {
    const e = Array.isArray(r.event) ? r.event[0] : r.event;
    return { id: r.id, title: e?.title ?? "", description: e?.description ?? null, startsAt: r.starts_at };
  });
}

export default async function SchoolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const sp = await searchParams;
  const fromRaw = Array.isArray(sp.from) ? sp.from[0] : sp.from;
  const from = fromRaw && /^[a-z0-9-]{1,40}$/i.test(fromRaw) ? fromRaw.toLowerCase() : null;

  const [b, upcoming] = await Promise.all([getBlocks("schools", locale), upcomingForSchools()]);

  const note = b["schools.masterclass_note"];
  const before = (
    <>
      {note && (
        <section className="mx-auto max-w-6xl px-6 pt-4">
          <div className="glass-strong rounded-3xl border-gold/50 p-6 sm:p-8">
            {paragraphs(note).map((p, i) => (
              <p key={i} className={(i ? "mt-3 " : "") + "font-display text-xl leading-relaxed text-ink"}>
                {p}
              </p>
            ))}
          </div>
        </section>
      )}
      {(b["schools.intro"] || b["schools.ages"]) && (
        <section className="mx-auto max-w-6xl px-6 pt-6">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-start">
            <div className="space-y-4">
              {paragraphs(b["schools.intro"]).map((p, i) => (
                <p key={i} className={i === 0 ? "font-display text-2xl font-bold leading-snug text-ink" : "text-lg leading-relaxed text-ink/75"}>
                  {p}
                </p>
              ))}
            </div>
            {b["schools.ages"] && (
              <div className="glass rounded-2xl p-6">
                <p className="font-display text-3xl font-black text-brand-deep">Be Great!</p>
                <p className="text-shimmer font-display text-3xl font-black">{locale === "es" ? "¡YO SOY!" : "I AM!"}</p>
                <p className="mt-4 border-t border-brand-deep/15 pt-4 text-sm font-medium leading-relaxed text-ink/70">{b["schools.ages"]}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );

  const after =
    upcoming.length > 0 ? (
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="font-display text-2xl font-bold text-ink">{UI[locale].upcoming}</h2>
        <ul className="mt-6 space-y-3">
          {upcoming.map((u) => (
            <li key={u.id} className="glass rounded-2xl p-5">
              <p className="font-bold text-ink">{u.title}</p>
              <p className="text-sm font-semibold text-brand-deep">{formatWhen(u.startsAt, locale)}</p>
              {u.description && <p className="mt-2 text-sm leading-relaxed text-ink/70">{u.description}</p>}
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const formIntro = b["schools.form_intro"] ? (
    <p className="mt-3 max-w-2xl leading-relaxed text-ink/70">{b["schools.form_intro"]}</p>
  ) : null;

  const View = locale === "es" ? SchoolsEs : SchoolsEn;
  return <View b={b} from={from} before={before} after={after} formIntro={formIntro} />;
}
