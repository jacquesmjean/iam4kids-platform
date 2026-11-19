"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { t, type Locale } from "@/i18n/copy";
import { derive, SAMPLE, type Draft } from "@/lib/content/derive";

type Decision = "pending" | "approved" | "rejected";

const CHANNEL_COLOR: Record<string, string> = {
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  instagram: "#c13584",
  x: "#0b1b3a",
  tiktok: "#111111",
  youtube: "#ff0000",
  email: "#2563eb",
  substack: "#ff6719",
};

export function ContentWorkbench({
  locale,
  guardrails,
}: {
  locale: Locale;
  guardrails: { title: string; body: string }[];
}) {
  const c = t(locale).content;

  const [source, setSource] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const drafts: Draft[] = useMemo(() => (submitted ? derive(submitted) : []), [submitted]);

  const approved = Object.values(decisions).filter((d) => d === "approved").length;
  const pending = drafts.length - Object.values(decisions).filter((d) => d !== "pending").length;

  function run() {
    if (source.trim().length < 40) return;
    setSubmitted(source);
    setDecisions({});
  }

  function decide(id: string, d: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: d }));
  }

  return (
    <>
      <Nav locale={locale} current="content" />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0b1b3a]">{c.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#12224a]/80">{c.lede}</p>
        <p className="mt-4 max-w-3xl rounded-lg bg-[#f4f6fb] px-4 py-3 text-sm leading-relaxed text-[#12224a]/80">
          {c.channelsNote}
        </p>

        {/* Mark's approved guardrails, live from Atlas. Shown beside the drafts
            because a rule nobody can see while working is a rule nobody follows. */}
        {guardrails.length > 0 && (
          <section className="mt-8 rounded-2xl border border-[#f5a524]/40 bg-[#fffaf0] p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5a00]">{c.guardrailsTitle}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {guardrails.map((g) => (
                <li key={g.title} className="text-sm leading-relaxed text-[#12224a]/85">
                  <span className="font-semibold text-[#0b1b3a]">{g.title}. </span>
                  {g.body}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#8a5a00]">{c.guardrailsSource}</p>
          </section>
        )}

        {/* Input */}
        <section className="mt-10 rounded-2xl border border-[#0b1b3a]/10 bg-white p-6">
          <label className="text-sm font-semibold text-[#0b1b3a]">{c.inputLabel}</label>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={c.placeholder}
            rows={8}
            className="mt-3 w-full resize-y rounded-lg border border-[#0b1b3a]/15 bg-[#fdfdfd] p-4 text-sm leading-relaxed text-[#0b1b3a] outline-none focus:border-[#2563eb]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={run}
              disabled={source.trim().length < 40}
              className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-40"
            >
              {c.generate}
            </button>
            <button
              onClick={() => setSource(SAMPLE)}
              title={c.sampleNote}
              className="rounded-lg border border-[#0b1b3a]/15 px-4 py-2.5 text-sm font-semibold text-[#0b1b3a] transition hover:border-[#0b1b3a]/40"
            >
              {c.sample}
            </button>
            {source && (
              <button
                onClick={() => {
                  setSource("");
                  setSubmitted("");
                  setDecisions({});
                }}
                className="text-sm font-medium text-[#12224a]/50 hover:text-[#12224a]"
              >
                {c.clear}
              </button>
            )}
            <span className="ml-auto text-xs text-[#12224a]/45">
              {source.length} {c.charCount}
            </span>
          </div>
          {source.trim().length > 0 && source.trim().length < 40 && (
            <p className="mt-3 text-sm text-[#8a5a00]">{c.tooShort}</p>
          )}
        </section>

        {/* The gate */}
        {drafts.length > 0 && (
          <section className="mt-10 rounded-2xl bg-[#0b1b3a] p-8 text-white">
            <div className="flex flex-wrap items-baseline gap-4">
              <h2 className="text-xl font-bold">{c.gateTitle}</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                {drafts.length} · {approved} ✓ · {pending} {c.pending.toLowerCase()}
              </span>
            </div>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{c.gateBody}</p>
          </section>
        )}

        {/* Drafts */}
        <section className="mt-8 space-y-4">
          {drafts.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#0b1b3a]/20 p-10 text-center text-sm text-[#12224a]/50">
              {c.empty}
            </p>
          )}

          {drafts.map((d) => {
            const decision = decisions[d.id] ?? "pending";
            return (
              <article
                key={d.id}
                className={
                  "rounded-xl border bg-white p-6 transition " +
                  (decision === "approved"
                    ? "border-emerald-400/60 bg-emerald-50/40"
                    : decision === "rejected"
                      ? "border-[#0b1b3a]/10 opacity-55"
                      : "border-[#0b1b3a]/10")
                }
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: CHANNEL_COLOR[d.channel] }}
                  />
                  <h3 className="font-semibold text-[#0b1b3a]">{d.label}</h3>
                  <span
                    className={
                      "rounded-md px-2 py-0.5 text-xs font-medium " +
                      (d.mode === "api"
                        ? "bg-[#f4f6fb] text-[#2563eb]"
                        : "bg-[#fffaf0] text-[#8a5a00]")
                    }
                  >
                    {d.mode === "api" ? c.apiMode : c.handoffMode}
                  </span>
                  {d.limit && (
                    <span className="text-xs tabular-nums text-[#12224a]/45">
                      {d.body.length}/{d.limit}
                    </span>
                  )}
                  <span
                    className={
                      "ml-auto text-xs font-semibold " +
                      (decision === "approved"
                        ? "text-emerald-700"
                        : decision === "rejected"
                          ? "text-[#12224a]/50"
                          : "text-[#8a5a00]")
                    }
                  >
                    {decision === "approved"
                      ? c.approved
                      : decision === "rejected"
                        ? c.rejected
                        : c.pending}
                  </span>
                </div>

                <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#12224a]/85">
                  {d.body}
                </pre>

                {d.mode === "handoff" && (
                  <p className="mt-3 rounded-md bg-[#fffaf0] px-3 py-2 text-xs leading-relaxed text-[#8a5a00]">
                    {c.handoffWhy}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => decide(d.id, decision === "approved" ? "pending" : "approved")}
                    className={
                      "rounded-lg px-4 py-2 text-sm font-semibold transition " +
                      (decision === "approved"
                        ? "bg-emerald-600 text-white"
                        : "border border-[#0b1b3a]/15 text-[#0b1b3a] hover:border-emerald-500 hover:text-emerald-700")
                    }
                  >
                    {c.approve}
                  </button>
                  <button
                    onClick={() => decide(d.id, decision === "rejected" ? "pending" : "rejected")}
                    className={
                      "rounded-lg px-4 py-2 text-sm font-semibold transition " +
                      (decision === "rejected"
                        ? "bg-[#0b1b3a] text-white"
                        : "border border-[#0b1b3a]/15 text-[#0b1b3a] hover:border-[#0b1b3a]/50")
                    }
                  >
                    {c.reject}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <p className="mt-10 rounded-xl border border-[#0b1b3a]/10 bg-white p-5 text-sm leading-relaxed text-[#12224a]/65">
          {c.honest}
        </p>
      </main>
    </>
  );
}
