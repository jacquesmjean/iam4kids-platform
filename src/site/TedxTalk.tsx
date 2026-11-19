"use client";

import Link from "next/link";
import { useState } from "react";
import type { SiteLocale } from "./copy";

/**
 * Mark's TEDx talk. The video loads only when the visitor presses play
 * (youtube-nocookie), so the page stays fast and nothing is tracked
 * until someone chooses to watch. The poster is drawn, not a frame
 * from the video. The quote is Mark's own words from the
 * talk, verbatim. No TEDx logo: TED controls its use.
 */
const VIDEO = "Zy2raFYSQLg";

const C = {
  en: {
    eyebrow: "On the TEDx stage",
    title: "What we were taught to outgrow",
    sub: "Mark's talk at TEDxU Pitt Johnstown, October 23, 2026.",
    play: "Watch the talk",
    strip: "As seen on the TEDx stage",
    stripCta: "Watch Mark's talk",
    lang: null as string | null,
  },
  es: {
    eyebrow: "En el escenario de TEDx",
    title: "What we were taught to outgrow",
    sub: "La charla de Mark en TEDxU Pitt Johnstown, 23 de octubre de 2026.",
    play: "Ver la charla",
    strip: "En el escenario de TEDx",
    stripCta: "Mira la charla de Mark",
    lang: "Charla en inglés." as string | null,
  },
};

const QUOTE = "Growing up was never supposed to make us smaller. Wisdom should never cost us wonder.";

export function TedxTalk({ locale }: { locale: SiteLocale }) {
  const t = C[locale];
  const [playing, setPlaying] = useState(false);

  return (
    <section id="tedx" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 py-14">
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="glass-strong overflow-hidden rounded-3xl p-2">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${VIDEO}?autoplay=1&rel=0`}
                title={`${t.title}, Mark Papadas, TEDxU Pitt Johnstown`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={t.play}>
                <span className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,rgba(240,180,41,.35),transparent_70%),linear-gradient(160deg,#16324f,#0a1628)] transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-x-0 top-6 text-center font-display text-sm font-bold uppercase tracking-[0.3em] text-gold-soft/90">TEDxU Pitt Johnstown</span>
                <span className="absolute inset-x-6 bottom-6 text-center font-display text-xl font-bold text-white sm:text-2xl">{t.title}</span>
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-6 py-3 font-bold text-ink ring-cta transition group-hover:scale-105">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
                  </svg>
                  {t.play}
                </span>
              </button>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-deep/90">{t.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{t.title}</h2>
          <p className="mt-3 text-ink/65">
            {t.sub}
            {t.lang ? ` ${t.lang}` : ""}
          </p>
          <blockquote className="mt-8 border-l-4 border-gold pl-5">
            <p className="font-display text-2xl font-semibold leading-snug text-ink">“{QUOTE}”</p>
            <footer className="mt-3 text-sm font-semibold text-brand-deep">Mark Papadas</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

/** A slim link on the home page that points to the talk on the Founder page. */
export function TedxStrip({ locale }: { locale: SiteLocale }) {
  const t = C[locale];
  return (
    <section className="mx-auto max-w-6xl px-6 pt-4">
      <Link
        href={`/${locale}/founder#tedx`}
        className="glass card-hover flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft text-ink">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
            </svg>
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-gold-deep">{t.strip}</span>
            <span className="font-display text-lg font-bold text-ink">{t.title}</span>
          </span>
        </span>
        <span className="text-sm font-bold text-brand-deep">{t.stripCta} →</span>
      </Link>
    </section>
  );
}
