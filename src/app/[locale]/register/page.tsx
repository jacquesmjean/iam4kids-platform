"use client";

import Link from "next/link";
import { useState } from "react";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { use } from "react";

type Dict = Record<string, string>;
const DICTS: Record<string, Dict> = { en, es };

interface PlannedWrite {
  table: string;
  note: string;
}

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = DICTS[locale] ?? DICTS.en;

  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [writes, setWrites] = useState<PlannedWrite[]>([]);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");

    try {
      const res = await fetch("/api/v1/events/be-great-family-reset/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianName: form.get("guardianName"),
          guardianEmail: form.get("guardianEmail"),
          childFirstName: form.get("childFirstName"),
          childAge: Number(form.get("childAge")),
          language: locale === "es" ? "es" : "en",
          guardianConsent: form.get("guardianConsent") === "on",
          source: "foundation-demo",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error ?? t["event.register.error"]);
        setState("error");
        return;
      }

      setWrites(json.writes ?? []);
      setPreview(Boolean(json.preview));
      setState("done");
    } catch {
      setMessage("Something went wrong reaching the server.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-3xl font-bold text-[#0b1b3a]">{t["event.confirm.title"]}</h1>
        <p className="mt-4 leading-relaxed text-[#12224a]/75">{t["event.confirm.body"]}</p>

        <div className="mt-10 rounded-xl border border-[#0b1b3a]/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            What that one submission {preview ? "would write" : "wrote"}
          </p>
          <ul className="mt-4 space-y-3">
            {writes.map((w) => (
              <li key={w.table} className="text-sm">
                <span className="font-mono font-semibold text-[#0b1b3a]">{w.table}</span>
                <span className="text-[#12224a]/70"> — {w.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-[#0b1b3a]/10 pt-4 text-sm text-[#12224a]/60">
            Six records. Zero child accounts. The child is in the database because we count and
            celebrate them — and there is no column anywhere that could be used to contact them.
          </p>
          {preview && (
            <p className="mt-3 text-xs text-[#8a5a00]">
              Preview mode — database credentials are not set on this deployment, so nothing was
              saved.
            </p>
          )}
        </div>

        <Link href={`/${locale}`} className="mt-8 inline-block text-sm font-semibold text-[#2563eb]">
          &larr; Back to the foundation
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <Link href={`/${locale}`} className="text-sm font-semibold text-[#2563eb]">
        &larr; Foundation
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-[#0b1b3a]">{t["event.register.title"]}</h1>
      <p className="mt-3 text-[#12224a]/70">
        Be Great! Family Reset — the parent registers, the whole family attends.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <Field name="guardianName" label={t["event.register.guardianName"]} />
        <Field name="guardianEmail" label={t["event.register.email"]} type="email" />
        <Field name="childFirstName" label={t["event.register.childFirstName"]} />
        <Field name="childAge" label={t["event.register.childAge"]} type="number" min={4} max={18} />

        <label className="flex gap-3 rounded-xl border border-[#0b1b3a]/10 bg-white p-4 text-sm leading-relaxed text-[#12224a]/80">
          <input
            type="checkbox"
            name="guardianConsent"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#2563eb]"
          />
          <span>{t["event.register.consent"]}</span>
        </label>

        {state === "error" && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-lg bg-[#2563eb] px-5 py-3.5 font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          {state === "sending" ? "…" : t["event.register.submit"]}
        </button>
      </form>
    </main>
  );
}

function Field({
  name,
  label,
  type = "text",
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0b1b3a]">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        required
        className="mt-2 w-full rounded-lg border border-[#0b1b3a]/15 bg-white px-4 py-3 text-[#0b1b3a] outline-none focus:border-[#2563eb]"
      />
    </label>
  );
}
