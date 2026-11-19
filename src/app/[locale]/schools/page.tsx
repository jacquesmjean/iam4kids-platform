import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { isLocale, type Locale } from "@/i18n/copy";
import { getBlocks, paragraphs } from "@/lib/blocks";
import { publicDb } from "@/lib/public-db";
import { formatWhen } from "@/lib/time";
import { SchoolForm } from "./SchoolForm";

/**
 * The page Mark sends school leaders to.
 *
 * Every word on it comes from the site_block table, which Mark edits himself
 * in the staff console (Page editor). The wording was seeded from his own
 * iam4kids.com/schools page, so nothing here was written for him.
 *
 * ?from=masterclass tags the inquiry and preselects "I attended the
 * Masterclass", so the 10 December link can be measured on its own.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bring I AM 4 Kids to your school",
  description:
    "The I AM 4 Kids School Experience helps students build confidence, character, and leadership alongside academics.",
  robots: { index: true, follow: true },
};

const UI = {
  en: { cta: "Start a conversation", upcoming: "Upcoming for school leaders", callout: "Be Great!", response: "I AM!" },
  es: { cta: "Iniciar una conversación", upcoming: "Próximamente para líderes escolares", callout: "Be Great!", response: "I AM!" },
} as const;

interface UpcomingRow {
  id: string;
  starts_at: string;
  event: { title: string; description: string | null; audience: string | null } | { title: string; description: string | null; audience: string | null }[] | null;
}

async function upcomingForSchools(): Promise<{ id: string; title: string; description: string | null; startsAt: string }[]> {
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
  const locale: Locale = isLocale(raw) ? raw : "en";
  const sp = await searchParams;
  const fromRaw = Array.isArray(sp.from) ? sp.from[0] : sp.from;
  const from = fromRaw && /^[a-z0-9-]{1,40}$/i.test(fromRaw) ? fromRaw.toLowerCase() : null;

  const [b, upcoming] = await Promise.all([getBlocks("schools", locale), upcomingForSchools()]);
  const ui = UI[locale];

  const moments = [1, 2, 3, 4, 5]
    .map((n) => ({ n, title: b[`schools.moment_${n}_title`], body: b[`schools.moment_${n}_body`] }))
    .filter((m) => m.title || m.body);

  const options = [1, 2]
    .map((n) => ({
      n,
      title: b[`schools.option_${n}_title`],
      price: b[`schools.option_${n}_price`],
      body: b[`schools.option_${n}_body`],
    }))
    .filter((o) => o.title);

  return (
    <>
      <Nav locale={locale} current="schools" />

      <main>
        {/* Hero */}
        <section className="bg-[#0b1b3a] text-white">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
            {b["schools.eyebrow"] && (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f5a524]">{b["schools.eyebrow"]}</p>
            )}
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              {b["schools.title"] || "I AM 4 Kids"}
            </h1>
            {b["schools.subtitle"] && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">{b["schools.subtitle"]}</p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#talk"
                className="rounded-lg bg-[#f5a524] px-6 py-3.5 text-sm font-bold text-[#0b1b3a] transition hover:bg-[#ffb83d]"
              >
                {b["schools.form_title"] || ui.cta}
              </a>
              {b["schools.ages"] && <span className="text-sm text-white/65">{b["schools.ages"]}</span>}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6">
          {/* Note for Masterclass attendees, shown only when Mark writes one */}
          {b["schools.masterclass_note"] && (
            <section className="-mt-8 rounded-2xl border-2 border-[#f5a524] bg-[#fffaf0] p-6 shadow-sm md:p-8">
              {paragraphs(b["schools.masterclass_note"]).map((p, i) => (
                <p key={i} className={(i ? "mt-3 " : "") + "text-lg leading-relaxed text-[#0b1b3a]"}>
                  {p}
                </p>
              ))}
            </section>
          )}

          {/* Intro */}
          <section className="mt-16 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="space-y-5">
              {paragraphs(b["schools.intro"]).map((p, i) => (
                <p key={i} className={i === 0 ? "text-2xl font-semibold leading-snug text-[#0b1b3a]" : "text-lg leading-relaxed text-[#12224a]/80"}>
                  {p}
                </p>
              ))}
            </div>
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-[#0b1b3a]/10">
              <p className="text-4xl font-black text-[#2563eb] md:text-5xl">{ui.callout}</p>
              <p className="mt-2 text-4xl font-black text-[#f5a524] md:text-5xl">{ui.response}</p>
              {b["schools.reach"] && (
                <p className="mt-6 border-t border-[#0b1b3a]/10 pt-5 text-sm font-medium leading-relaxed text-[#12224a]/75">
                  {b["schools.reach"]}
                </p>
              )}
            </div>
          </section>

          {/* Five moments */}
          {moments.length > 0 && (
            <section className="mt-20">
              <h2 className="text-3xl font-bold text-[#0b1b3a]">{b["schools.moments_title"]}</h2>
              <ol className="mt-8 grid gap-4 md:grid-cols-5">
                {moments.map((m) => (
                  <li key={m.n} className="rounded-2xl border border-[#0b1b3a]/10 bg-white p-5 shadow-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1b3a] text-sm font-bold text-white">
                      {m.n}
                    </span>
                    <h3 className="mt-4 font-bold text-[#0b1b3a]">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#12224a]/75">{m.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Two options */}
          {options.length > 0 && (
            <section className="mt-20">
              <h2 className="text-3xl font-bold text-[#0b1b3a]">{b["schools.options_title"]}</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {options.map((o) => (
                  <div
                    key={o.n}
                    className={
                      "flex flex-col rounded-2xl p-7 shadow-sm " +
                      (o.n === 2 ? "bg-[#0b1b3a] text-white" : "border border-[#0b1b3a]/10 bg-white")
                    }
                  >
                    <h3 className={"text-xl font-bold " + (o.n === 2 ? "text-white" : "text-[#0b1b3a]")}>{o.title}</h3>
                    {o.price && (
                      <p className={"mt-2 text-3xl font-black " + (o.n === 2 ? "text-[#f5a524]" : "text-[#2563eb]")}>{o.price}</p>
                    )}
                    {o.body && (
                      <p className={"mt-4 leading-relaxed " + (o.n === 2 ? "text-white/80" : "text-[#12224a]/80")}>{o.body}</p>
                    )}
                  </div>
                ))}
              </div>
              {b["schools.travel_note"] && <p className="mt-4 text-sm text-[#12224a]/60">{b["schools.travel_note"]}</p>}
            </section>
          )}

          {/* Upcoming events for school leaders, when Mark schedules one */}
          {upcoming.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl font-bold text-[#0b1b3a]">{ui.upcoming}</h2>
              <ul className="mt-6 space-y-3">
                {upcoming.map((u) => (
                  <li key={u.id} className="rounded-2xl border border-[#0b1b3a]/10 bg-white p-5">
                    <p className="font-bold text-[#0b1b3a]">{u.title}</p>
                    <p className="text-sm font-medium text-[#2563eb]">{formatWhen(u.startsAt, locale)}</p>
                    {u.description && <p className="mt-2 text-sm leading-relaxed text-[#12224a]/75">{u.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* The form */}
          <section id="talk" className="mt-20 scroll-mt-20 rounded-3xl border border-[#0b1b3a]/10 bg-white p-6 shadow-sm md:p-10">
            <h2 className="text-3xl font-bold text-[#0b1b3a]">{b["schools.form_title"] || ui.cta}</h2>
            {b["schools.form_intro"] && (
              <p className="mt-3 max-w-2xl leading-relaxed text-[#12224a]/75">{b["schools.form_intro"]}</p>
            )}
            <div className="mt-8">
              <SchoolForm locale={locale} thanks={b["schools.thanks"] ?? ""} from={from} />
            </div>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
