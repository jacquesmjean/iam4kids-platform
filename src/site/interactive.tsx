"use client";

import { useEffect, useRef, useState } from "react";
import { site, type SiteLocale } from "./copy";

/* ------------------------------------------------------------------ */
/* Be Great! / I AM!  The call and response, with a burst of stars.    */
/* ------------------------------------------------------------------ */

const BG = {
  en: { call: "Be Great!", answer: "I AM!", hint: "Tap it. Say it out loud!" },
  es: { call: "Be Great!", answer: "¡YO SOY!", hint: "Tócalo. ¡Dilo en voz alta!" },
};

interface Spark {
  id: number;
  angle: number;
  dist: number;
  size: number;
  delay: number;
}

export function BeGreat({ locale }: { locale: SiteLocale }) {
  const t = BG[locale];
  const [on, setOn] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const next = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fire() {
    setSparks(
      Array.from({ length: 14 }, (_, i) => ({
        id: next.current++,
        angle: (i / 14) * 360 + Math.random() * 20,
        dist: 70 + Math.random() * 70,
        size: 10 + Math.random() * 14,
        delay: Math.random() * 0.08,
      }))
    );
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOn(false);
      setSparks([]);
    }, 1600);
  }

  return (
    <div className="relative inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={fire}
        aria-live="polite"
        className={
          "relative select-none overflow-visible rounded-2xl px-8 py-4 font-display text-2xl font-black transition-all duration-200 sm:text-3xl " +
          (on
            ? "scale-110 bg-white text-ink shadow-[0_0_60px_rgba(255,217,122,0.9)]"
            : "bg-gradient-to-r from-gold-deep via-gold to-gold-soft text-ink ring-cta hover:scale-105 active:scale-95")
        }
      >
        {on ? t.answer : t.call}
        {sparks.map((s) => (
          <span
            key={s.id}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 text-gold"
            style={
              {
                width: s.size,
                height: s.size,
                animation: `begreat-fly .9s cubic-bezier(.2,.8,.3,1) ${s.delay}s forwards`,
                "--angle": `${s.angle}deg`,
                "--dist": `${s.dist}px`,
              } as React.CSSProperties
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
            </svg>
          </span>
        ))}
      </button>
      <span className="text-xs font-medium text-ink/60">{t.hint}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* I AM ____.  The words that rotate in the home page hero.            */
/* ------------------------------------------------------------------ */

const WORDS = {
  en: { iam: "I AM", words: ["confident.", "capable.", "a leader.", "resilient.", "brave.", "kind."] },
  es: { iam: "YO SOY", words: ["confiado.", "capaz.", "un líder.", "resiliente.", "valiente.", "amable."] },
};

export function RotatingWords({ locale }: { locale: SiteLocale }) {
  const { iam, words } = WORDS[locale];
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShown(false);
      setTimeout(() => {
        setI((n) => (n + 1) % words.length);
        setShown(true);
      }, 350);
    }, 2600);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <p className="font-display text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
      <span className="text-ink">{iam} </span>
      <span
        aria-live="polite"
        className={
          "text-shimmer inline-block transition-all duration-300 " +
          (shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")
        }
      >
        {words[i]}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Get Started. Writes straight into the staff console's inbox.        */
/* ------------------------------------------------------------------ */

const field =
  "w-full rounded-xl border border-brand-deep/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold/60 focus:outline-none";
const lbl = "mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink/65";

export function IntakeForm({
  locale,
  defaultType = "parent",
  defaultInterest = "family",
  source,
}: {
  locale: SiteLocale;
  defaultType?: string;
  defaultInterest?: string;
  source?: string;
}) {
  const t = site(locale).form;
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [type, setType] = useState(defaultType);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/v1/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: fd.get("type"),
          interest: fd.get("interest"),
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          org: fd.get("org"),
          message: fd.get("message"),
          language: fd.get("language"),
          website: fd.get("website"),
          source: source ?? (typeof window !== "undefined" ? window.location.pathname : null),
        }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="glass rounded-3xl p-8 text-center sm:p-10">
        <p className="font-display text-3xl font-bold text-ink">{t.thanksTitle}</p>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/70">{t.thanksBody}</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 rounded-xl border border-brand-deep/20 px-5 py-2.5 text-sm font-bold text-ink/80 transition hover:border-gold-deep/60 hover:text-gold-deep"
        >
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={lbl} htmlFor="f-type">
            {t.type} *
          </label>
          <select id="f-type" name="type" required className={field} value={type} onChange={(e) => setType(e.target.value)}>
            {t.types.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor="f-interest">
            {t.interest} *
          </label>
          <select id="f-interest" name="interest" required className={field} defaultValue={defaultInterest}>
            {t.interests.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor="f-name">
            {t.name} *
          </label>
          <input id="f-name" name="name" required maxLength={200} autoComplete="name" className={field} />
        </div>
        <div>
          <label className={lbl} htmlFor="f-email">
            {t.email} *
          </label>
          <input id="f-email" name="email" type="email" required maxLength={255} autoComplete="email" className={field} />
        </div>
        <div>
          <label className={lbl} htmlFor="f-phone">
            {t.phone}
          </label>
          <input id="f-phone" name="phone" type="tel" maxLength={50} autoComplete="tel" className={field} />
        </div>
        <div>
          <label className={lbl} htmlFor="f-org">
            {type === "school" ? `${t.orgSchool} *` : t.org}
          </label>
          <input
            id="f-org"
            name="org"
            maxLength={300}
            autoComplete="organization"
            required={type === "school"}
            className={field}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl} htmlFor="f-message">
            {t.message}
          </label>
          <textarea id="f-message" name="message" rows={4} maxLength={5000} className={field} />
        </div>
        <div>
          <label className={lbl} htmlFor="f-lang">
            {t.language}
          </label>
          <select id="f-lang" name="language" className={field} defaultValue={locale}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="f-website">Website</label>
          <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      {state === "error" && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {t.error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-6 py-4 font-bold text-ink ring-cta transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}
