import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { t, isLocale, type Locale } from "@/i18n/copy";
import { getImpactCounts } from "@/lib/public-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border p-5 " +
        (accent
          ? "border-[#f5a524]/40 bg-[#fffaf0]"
          : "border-[#0b1b3a]/10 bg-white")
      }
    >
      <p className="text-3xl font-bold tabular-nums text-[#0b1b3a]">{value}</p>
      <p className="mt-1 text-sm text-[#12224a]/65">{label}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
        {title}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

export default async function ImpactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const c = t(locale).impact;

  const counts = await getImpactCounts();
  const live = counts !== null;

  // "—" not "0" when the database is unreachable. A dashboard that shows a
  // zero it cannot verify is telling you something it does not know.
  const n = (v: number | undefined) =>
    live && v !== undefined ? v.toLocaleString(locale === "es" ? "es-ES" : "en-US") : "—";

  const rate = (() => {
    if (!live || !counts) return "—";
    const seen = counts.attended + counts.no_shows;
    if (seen === 0) return "—";
    return `${Math.round((counts.attended / seen) * 100)}%`;
  })();

  return (
    <>
      <Nav locale={locale} current="impact" />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0b1b3a]">{c.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#12224a]/80">{c.lede}</p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#0b1b3a]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#12224a]/70">
          <span
            className={
              "h-2 w-2 rounded-full " + (live ? "bg-emerald-500" : "bg-[#f5a524]")
            }
          />
          {live ? c.liveNote : c.offlineNote.split(".")[0] + "."}
        </div>

        <Group title={c.groupReach}>
          <Stat label={c.families} value={n(counts?.families)} accent />
          <Stat label={c.children} value={n(counts?.children)} accent />
          <Stat label={c.guardians} value={n(counts?.guardians)} />
          <Stat label={c.schools} value={n(counts?.schools)} />
        </Group>

        <Group title={c.groupEvents}>
          <Stat label={c.sessionsUpcoming} value={n(counts?.sessions_upcoming)} />
          <Stat label={c.sessionsHeld} value={n(counts?.sessions_held)} />
          <Stat label={c.registrations} value={n(counts?.registrations)} />
          <Stat label={c.attendanceRate} value={rate} accent />
        </Group>

        <Group title={c.groupTrust}>
          <Stat label={c.consents} value={n(counts?.consents)} />
          <Stat label={c.attended} value={n(counts?.attended)} />
          <Stat label={c.noShows} value={n(counts?.no_shows)} />
          <Stat label={c.openExceptions} value={n(counts?.open_exceptions)} />
        </Group>

        <Group title={c.groupContent}>
          <Stat label={c.contentAssets} value={n(counts?.content_assets)} />
          <Stat label={c.awaitingApproval} value={n(counts?.awaiting_approval)} />
          <Stat label={c.published} value={n(counts?.published)} />
          <Stat label="" value="" />
        </Group>

        {!live && (
          <p className="mt-10 rounded-xl border border-[#f5a524]/40 bg-[#fffaf0] p-6 text-sm leading-relaxed text-[#12224a]/80">
            {c.offlineNote}
          </p>
        )}

        <section className="mt-16 rounded-2xl bg-[#0b1b3a] p-8 text-white md:p-10">
          <h2 className="text-xl font-bold">{c.whyZero}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{c.whyZeroBody}</p>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
