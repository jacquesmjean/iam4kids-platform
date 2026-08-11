import Link from "next/link";
import { Nav } from "@/components/Nav";
import { t, isLocale, type Locale } from "@/i18n/copy";
import { LAYERS, TABLES, WEEKS, DECISIONS } from "@/i18n/data";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function FoundationConsole({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const c = t(locale).home;

  return (
    <>
      <Nav locale={locale} current="foundation" />
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0b1b3a] md:text-5xl">
          {c.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#12224a]/80">{c.lede}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/register`}
            className="rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            {c.ctaRegister} &rarr;
          </Link>
          <Link
            href={`/${locale}/impact`}
            className="rounded-lg border border-[#0b1b3a]/15 px-5 py-3 text-sm font-semibold text-[#0b1b3a] transition hover:border-[#0b1b3a]/40"
          >
            {c.ctaImpact}
          </Link>
          <a
            href="https://iam4kids-os.vercel.app/en/vision"
            className="rounded-lg border border-[#0b1b3a]/15 px-5 py-3 text-sm font-semibold text-[#0b1b3a] transition hover:border-[#0b1b3a]/40"
          >
            {c.ctaVision}
          </a>
        </div>

        {/* The one decision */}
        <section className="mt-20 rounded-2xl bg-[#0b1b3a] p-8 text-white md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
            {c.decisionEyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">{c.decisionTitle}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{c.decisionBody}</p>
          <pre className="mt-6 overflow-x-auto rounded-lg bg-black/30 p-5 text-xs leading-relaxed text-[#c7d7ff]">
{`create table child_profile (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid references household(id) on delete cascade,
  organization_id uuid references organization(id) on delete set null,
  first_name      text not null,
  age_band        int  check (age_band between 4 and 18),
  created_at      timestamptz not null default now()
);
-- No email. No auth_user_id. No phone.`}
          </pre>
          <p className="mt-5 text-sm text-white/60">{c.decisionFooter}</p>
        </section>

        {/* Stack */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-[#0b1b3a]">{c.stackTitle}</h2>
          <p className="mt-3 max-w-2xl text-[#12224a]/70">{c.stackLede}</p>
          <div className="mt-8 space-y-3">
            {LAYERS[locale].map((layer) => (
              <div key={layer.tag} className="rounded-xl border border-[#0b1b3a]/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                  {layer.tag}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <span key={item} className="rounded-md bg-[#f4f6fb] px-3 py-1.5 text-sm text-[#12224a]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tables */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-[#0b1b3a]">{c.tablesTitle}</h2>
          <p className="mt-3 max-w-2xl text-[#12224a]/70">{c.tablesLede}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TABLES[locale].map((tb) => (
              <div key={tb.group} className="rounded-xl border border-[#0b1b3a]/10 bg-white p-5">
                <p className="text-sm font-semibold text-[#0b1b3a]">{tb.group}</p>
                <ul className="mt-3 space-y-1.5">
                  {tb.names.map((n) => (
                    <li key={n} className="font-mono text-xs text-[#12224a]/70">{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 30 days */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-[#0b1b3a]">{c.weeksTitle}</h2>
          <p className="mt-3 max-w-2xl text-[#12224a]/70">{c.weeksLede}</p>
          <div className="mt-8 space-y-4">
            {WEEKS[locale].map((w, i) => (
              <div key={w.week} className="rounded-xl border border-[#0b1b3a]/10 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="rounded-md bg-[#0b1b3a] px-2.5 py-1 text-xs font-semibold text-white">
                    {w.week}
                  </span>
                  <h3 className="text-lg font-semibold text-[#0b1b3a]">{w.title}</h3>
                  {i === 0 && (
                    <span className="rounded-full bg-[#f5a524]/15 px-2.5 py-1 text-xs font-semibold text-[#8a5a00]">
                      {c.inProgress}
                    </span>
                  )}
                </div>
                <ul className="mt-4 space-y-2">
                  {w.done.map((d) => (
                    <li key={d} className="flex gap-3 text-sm leading-relaxed text-[#12224a]/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Decisions */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-[#0b1b3a]">{c.decisionsTitle}</h2>
          <p className="mt-3 max-w-2xl text-[#12224a]/70">{c.decisionsLede}</p>
          <div className="mt-8 divide-y divide-[#0b1b3a]/10 rounded-xl border border-[#0b1b3a]/10 bg-white">
            {DECISIONS[locale].map((d) => (
              <div key={d.n} className="flex gap-4 p-5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4f6fb] text-xs font-semibold text-[#2563eb]">
                  {d.n}
                </span>
                <div>
                  <p className="font-semibold text-[#0b1b3a]">{d.d}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#12224a]/70">{d.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ownership */}
        <section className="mt-20 rounded-2xl border-2 border-[#f5a524]/40 bg-[#fffaf0] p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a00]">
            {c.ownershipEyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-bold text-[#0b1b3a]">{c.ownershipTitle}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#12224a]/80">{c.ownershipBody}</p>
        </section>

        <footer className="mt-20 border-t border-[#0b1b3a]/10 pt-8 text-sm text-[#12224a]/50">
          {c.footer}
        </footer>
      </main>
    </>
  );
}
