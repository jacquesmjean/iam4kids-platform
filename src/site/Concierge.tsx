"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, type SiteLocale } from "./copy";
import { XIcon } from "./SiteHeader";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function conversationId(): string {
  const make = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
          (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16)
        );
  try {
    const k = "iam4k-chat";
    const v = sessionStorage.getItem(k);
    if (v) return v;
    const id = make();
    sessionStorage.setItem(k, id);
    return id;
  } catch {
    return make();
  }
}

function Bubble({ role, children }: { role: Msg["role"]; children: React.ReactNode }) {
  return (
    <div className={"flex " + (role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed " +
          (role === "user"
            ? "rounded-br-md bg-gradient-to-r from-brand-deep to-brand text-white"
            : "rounded-bl-md bg-brand/10 text-ink")
        }
      >
        {children}
      </div>
    </div>
  );
}

export function Concierge({ locale }: { locale: SiteLocale }) {
  const t = site(locale);
  const c = t.concierge;
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const convo = useRef<string | null>(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, open]);

  async function send(preset?: string) {
    const message = (preset ?? text).trim();
    if (!message || busy) return;
    if (!convo.current) convo.current = conversationId();
    const next: Msg[] = [...msgs, { role: "user", content: message }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/v1/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: convo.current, message: message.slice(0, 1000), locale, page: path }),
      });
      const data = await res.json();
      setMsgs([...next, { role: "assistant", content: data.reply || c.error }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: c.error }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.a11y.openChat}
        className={
          "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-deep to-brand px-5 py-3.5 font-bold text-white shadow-2xl shadow-brand/40 transition hover:scale-105 " +
          (open ? "hidden" : "")
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        <span className="hidden sm:inline">{c.cta}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={c.label}
          className="fixed bottom-4 right-4 z-50 flex h-[min(560px,85dvh)] w-[min(94vw,400px)] flex-col overflow-hidden rounded-3xl glass-strong shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-brand-deep/15 bg-gradient-to-r from-brand/25 to-brand-glow/15 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-ink">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{c.label}</p>
                <p className="text-[11px] text-ink/65">EN · ES</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.a11y.closeChat} className="rounded-lg p-2 text-ink/80 hover:bg-brand/10">
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
            <Bubble role="assistant">{c.greeting}</Bubble>
            {msgs.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ))}
            {busy && (
              <div className="flex gap-1.5 pl-2" aria-label="typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-pulse-soft rounded-full bg-brand-glow" style={{ animationDelay: `${i * 0.25}s` }} />
                ))}
              </div>
            )}
            {!msgs.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {c.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-deep/40 px-3 py-1.5 text-xs text-ink/80 transition hover:border-gold-deep/60 hover:text-gold-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-brand-deep/15 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <label className="sr-only" htmlFor="concierge-input">
                {c.placeholder}
              </label>
              <input
                id="concierge-input"
                value={text}
                maxLength={1000}
                onChange={(e) => setText(e.target.value)}
                placeholder={c.placeholder}
                className="min-w-0 flex-1 rounded-xl border border-brand-deep/20 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-gold/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                aria-label={c.send}
                className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-r from-gold-deep to-gold text-ink transition disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                  <path d="m21.854 2.147-10.94 10.939" />
                </svg>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[10px] leading-tight text-ink/50">{c.disclaimer}</p>
              <Link href={`/${locale}/contact`} onClick={() => setOpen(false)} className="whitespace-nowrap text-[11px] font-bold text-gold-deep hover:underline">
                {c.handoff} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
