"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { t, isLocale, type Locale } from "@/i18n/copy";

/** A section of the form. Space between questions is what gets them answered. */
function Section({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-[#0b1b3a]/10 bg-white p-6 md:p-8">
      <h2 className="text-lg font-bold text-[#0b1b3a]">{title}</h2>
      {lede && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#12224a]/70">{lede}</p>}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function Area({
  name,
  label,
  placeholder,
  rows = 4,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0b1b3a]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-lg border border-[#0b1b3a]/15 bg-[#fdfdfd] px-4 py-3 text-sm leading-relaxed text-[#0b1b3a] outline-none placeholder:text-[#12224a]/35 focus:border-[#2563eb]"
      />
    </label>
  );
}

function Line({
  name,
  label,
  placeholder,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0b1b3a]">
        {label}
        {required && <span className="ml-1 text-[#f5a524]">*</span>}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-lg border border-[#0b1b3a]/15 bg-white px-4 py-3 text-[#0b1b3a] outline-none placeholder:text-[#12224a]/35 focus:border-[#2563eb]"
      />
    </label>
  );
}

export default function FeedbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : "en";
  const c = t(locale).feedback;

  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copy, setCopy] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /** If the save fails, show them their own words back rather than losing them. */
  function transcript(f: FormData): string {
    const rows: [string, string][] = [
      [c.name, String(f.get("authorName") ?? "")],
      [c.role, String(f.get("authorRole") ?? "")],
      [c.visionServes, String(f.get("visionServes") ?? "")],
      [c.visionMissing, String(f.get("visionMissing") ?? "")],
      [`${c.s3}: ${c.websiteLikes}`, String(f.get("websiteLikes") ?? "")],
      [`${c.s3}: ${c.websiteChanges}`, String(f.get("websiteChanges") ?? "")],
      [`${c.s4}: ${c.platformLikes}`, String(f.get("platformLikes") ?? "")],
      [`${c.s4}: ${c.platformChanges}`, String(f.get("platformChanges") ?? "")],
      [c.hopes, String(f.get("hopes") ?? "")],
      [c.goLiveDate, String(f.get("goLiveDate") ?? "")],
      [c.goLiveDriver, String(f.get("goLiveDriver") ?? "")],
      [c.priority, String(f.get("priority") ?? "")],
      [c.approver, String(f.get("approver") ?? "")],
      [c.guardrails, String(f.get("guardrails") ?? "")],
      [c.channels, String(f.get("channels") ?? "")],
      [c.anythingElse, String(f.get("anythingElse") ?? "")],
    ];
    return rows
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => `${k}\n${v}`)
      .join("\n\n");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);

    if (!String(f.get("authorName") ?? "").trim()) {
      setMessage(c.needName);
      setState("error");
      return;
    }

    setState("sending");

    const payload = {
      authorName: f.get("authorName"),
      authorRole: f.get("authorRole"),
      visionServes: f.get("visionServes"),
      visionMissing: f.get("visionMissing"),
      websiteLikes: f.get("websiteLikes"),
      websiteChanges: f.get("websiteChanges"),
      platformLikes: f.get("platformLikes"),
      platformChanges: f.get("platformChanges"),
      hopes: f.get("hopes"),
      goLiveDate: f.get("goLiveDate"),
      goLiveDriver: f.get("goLiveDriver"),
      priority: f.get("priority") || null,
      approver: f.get("approver"),
      guardrails: f.get("guardrails"),
      channels: f.get("channels"),
      anythingElse: f.get("anythingElse"),
      locale,
      source: "feedback-form",
    };

    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.saved) {
        setCopy(transcript(f));
        setMessage(c.failed);
        setState("error");
        return;
      }

      setState("done");
    } catch {
      setCopy(transcript(f));
      setMessage(c.failed);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <>
        <Nav locale={locale} current="feedback" />
        <main className="mx-auto max-w-2xl px-6 py-20">
          <h1 className="text-3xl font-bold text-[#0b1b3a]">{c.thanksTitle}</h1>
          <p className="mt-4 leading-relaxed text-[#12224a]/75">{c.thanksBody}</p>
          <Link
            href={`/${locale}`}
            className="mt-8 inline-block text-sm font-semibold text-[#2563eb]"
          >
            &larr; {c.thanksNext}
          </Link>
        </main>
      <SiteFooter locale={locale} />
      </>
    );
  }

  return (
    <>
      <Nav locale={locale} current="feedback" />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0b1b3a]">{c.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#12224a]/80">{c.lede}</p>
        <p className="mt-3 text-sm text-[#12224a]/55">{c.time}</p>

        <form ref={formRef} onSubmit={onSubmit}>
          <Section title={c.s1}>
            <Line name="authorName" label={c.name} required />
            <Line name="authorRole" label={c.role} placeholder={c.rolePlaceholder} />
          </Section>

          <Section title={c.s2} lede={c.s2lede}>
            <Area
              name="visionServes"
              label={c.visionServes}
              placeholder={c.visionServesPlaceholder}
              rows={5}
            />
            <Area
              name="visionMissing"
              label={c.visionMissing}
              placeholder={c.visionMissingPlaceholder}
              rows={5}
            />
          </Section>

          <Section title={c.s3} lede={c.s3lede}>
            <Area name="websiteLikes" label={c.websiteLikes} rows={3} />
            <Area
              name="websiteChanges"
              label={c.websiteChanges}
              placeholder={c.websiteChangesPlaceholder}
              rows={4}
            />
          </Section>

          <Section title={c.s4} lede={c.s4lede}>
            <Area name="platformLikes" label={c.platformLikes} rows={3} />
            <Area
              name="platformChanges"
              label={c.platformChanges}
              placeholder={c.platformChangesPlaceholder}
              rows={4}
            />
            <Area name="hopes" label={c.hopes} placeholder={c.hopesPlaceholder} rows={5} />
          </Section>

          <Section title={c.s5} lede={c.s5lede}>
            <div className="grid gap-6 md:grid-cols-2">
              <Line name="goLiveDate" label={c.goLiveDate} type="date" />
              <label className="block">
                <span className="text-sm font-semibold text-[#0b1b3a]">{c.priority}</span>
                <select
                  name="priority"
                  defaultValue=""
                  className="mt-2 w-full rounded-lg border border-[#0b1b3a]/15 bg-white px-4 py-3 text-[#0b1b3a] outline-none focus:border-[#2563eb]"
                >
                  <option value="">{c.priorityChoose}</option>
                  <option value="events">{c.pEvents}</option>
                  <option value="content">{c.pContent}</option>
                  <option value="schools">{c.pSchools}</option>
                  <option value="impact">{c.pImpact}</option>
                  <option value="public_site">{c.pPublicSite}</option>
                  <option value="not_sure">{c.pNotSure}</option>
                </select>
              </label>
            </div>
            <Area
              name="goLiveDriver"
              label={c.goLiveDriver}
              placeholder={c.goLiveDriverPlaceholder}
              rows={3}
            />
          </Section>

          <Section title={c.s6} lede={c.s6lede}>
            <Line name="approver" label={c.approver} placeholder={c.approverPlaceholder} />
            <Area
              name="guardrails"
              label={c.guardrails}
              placeholder={c.guardrailsPlaceholder}
              rows={4}
            />
            <Line name="channels" label={c.channels} placeholder={c.channelsPlaceholder} />
            <Area
              name="anythingElse"
              label={c.anythingElse}
              placeholder={c.anythingElsePlaceholder}
              rows={4}
            />
          </Section>

          {state === "error" && (
            <div className="mt-6 rounded-xl border border-[#f5a524]/50 bg-[#fffaf0] p-5">
              <p className="text-sm font-semibold text-[#8a5a00]">{message}</p>
              {copy && (
                <>
                  <p className="mt-2 text-xs text-[#12224a]/60">{c.savedLocal}</p>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-xs leading-relaxed text-[#12224a]/80">
                    {copy}
                  </pre>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={state === "sending"}
            className="mt-8 w-full rounded-lg bg-[#2563eb] px-5 py-4 font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            {state === "sending" ? c.sending : c.submit}
          </button>
        </form>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
