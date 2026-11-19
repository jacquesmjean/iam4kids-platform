import type { Metadata } from "next";
import Link from "next/link";
import { publicDb } from "@/lib/public-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Impact",
  description: "Results I AM 4 Kids has checked against evidence before publishing.",
};

/**
 * Public impact page. It shows only what Mark has approved in Atlas, and
 * every approved claim must carry evidence (a database constraint). The
 * operational counters that used to live here are in the staff console.
 */
const C = {
  en: {
    eyebrow: "Our impact",
    title: "Results we can stand behind.",
    lede: "Every result on this page was checked against evidence and approved by the I AM 4 Kids team before it was published.",
    emptyTitle: "Verified results are on their way.",
    emptyBody: "We publish results here only after they are checked against evidence. Until then, the best way to see the difference is to join us.",
    families: "For families",
    schools: "For schools",
  },
  es: {
    eyebrow: "Nuestro impacto",
    title: "Resultados que podemos respaldar.",
    lede: "Cada resultado de esta página fue verificado con evidencia y aprobado por el equipo de I AM 4 Kids antes de publicarse.",
    emptyTitle: "Los resultados verificados están en camino.",
    emptyBody: "Publicamos resultados aquí solo después de verificarlos con evidencia. Mientras tanto, la mejor forma de ver la diferencia es unirte.",
    families: "Para familias",
    schools: "Para escuelas",
  },
} as const;

export default async function ImpactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const c = C[locale];

  const db = publicDb();
  const track = db
    ? (((await db.rpc("public_track_record")).data as { title: string; body: string }[] | null) ?? [])
    : [];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-12 sm:pt-16">
          <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.3em] text-gold-deep/90">{c.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl animate-fade-up font-display text-4xl font-bold leading-[1.1] text-ink sm:text-6xl" style={{ animationDelay: "0.1s" }}>
            {c.title}
          </h1>
          <p className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-ink/75" style={{ animationDelay: "0.2s" }}>
            {c.lede}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {track.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {track.map((r) => (
              <article key={r.title} className="glass card-hover rounded-3xl p-7">
                <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">{r.title}</p>
                <p className="mt-3 font-display text-2xl font-bold leading-snug text-ink">{r.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <p className="font-display text-3xl font-bold text-ink">{c.emptyTitle}</p>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink/70">{c.emptyBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/${locale}/families`} className="rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-5 py-3 font-bold text-ink ring-cta transition hover:brightness-110">
                {c.families}
              </Link>
              <Link href={`/${locale}/schools`} className="rounded-xl border border-brand-deep/25 px-5 py-3 font-bold text-ink transition hover:border-gold-deep/60 hover:text-gold-deep">
                {c.schools}
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
