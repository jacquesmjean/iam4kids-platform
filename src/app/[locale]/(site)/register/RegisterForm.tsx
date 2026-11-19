"use client";

import Link from "next/link";
import { useState } from "react";
import { t, type Locale } from "@/i18n/copy";

/** Same format the server uses, in the family's own time zone. */
function when(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(locale === "es" ? "es-US" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function RegisterForm({ locale, slug }: { locale: Locale; slug: string }) {
  const c = t(locale).register;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ status: string; startsAt: string; email: string; preview: boolean } | null>(null);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("guardianEmail") ?? "");
    setState("sending");

    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch(`/api/v1/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianName: form.get("guardianName"),
          guardianEmail: email,
          childFirstName: form.get("childFirstName"),
          childAge: Number(form.get("childAge")),
          language: locale,
          guardianConsent: form.get("guardianConsent") === "on",
          source: params.get("utm_source") ?? params.get("from") ?? "register-page",
          campaign: params.get("utm_campaign") ?? undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error === "no-session" ? c.noDateError : c.error);
        setState("error");
        return;
      }
      setResult({ status: json.status, startsAt: json.startsAt, email, preview: Boolean(json.preview) });
      setState("done");
    } catch {
      setMessage(c.error);
      setState("error");
    }
  }

  if (state === "done" && result) {
    const waitlisted = result.status === "waitlisted";
    const body = (waitlisted ? c.waitlistBody : c.confirmBody)
      .replace("{when}", result.startsAt ? when(result.startsAt, locale) : "")
      .replace("{email}", result.email);
    return (
      <div role="status" className="glass-strong mt-8 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-ink">{waitlisted ? c.waitlistTitle : c.confirmTitle}</h2>
        <p className="mt-3 leading-relaxed text-ink/75">{body}</p>
        {result.preview && <p className="mt-4 text-xs text-gold-deep">{c.previewNote}</p>}
        <p className="mt-6 text-lg font-bold text-ink">Be Great!</p>
        <Link href={`/${locale}`} className="mt-6 inline-block text-sm font-semibold text-brand-deep">
          &larr; {c.back}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass mt-8 space-y-5 rounded-3xl p-6 sm:p-8">
      <Field name="guardianName" label={c.guardianName} autoComplete="name" />
      <Field name="guardianEmail" label={c.email} type="email" autoComplete="email" />
      <Field name="childFirstName" label={c.childFirstName} autoComplete="off" />
      <Field name="childAge" label={c.childAge} type="number" min={4} max={18} />

      <label className="flex gap-3 rounded-xl border border-brand-deep/10 bg-white p-4 text-sm leading-relaxed text-ink/80">
        <input type="checkbox" name="guardianConsent" required className="mt-1 h-4 w-4 shrink-0 accent-[#277db0]" />
        <span>{c.consent}</span>
      </label>

      {state === "error" && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft ring-cta px-5 py-3.5 text-ink font-bold transition hover:brightness-110 disabled:opacity-50"
      >
        {state === "sending" ? c.sending : c.submit}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  min,
  max,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  min?: number;
  max?: number;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        required
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-lg border border-brand-deep/15 bg-white px-4 py-3 text-ink outline-none focus:border-gold/60"
      />
    </label>
  );
}
