"use client";

import { useState } from "react";
type Locale = "en" | "es";

const COPY = {
  en: {
    name: "Your name",
    title: "Your title",
    titlePh: "Principal, Counselor, Assistant Superintendent",
    school: "School",
    email: "Email",
    phone: "Phone",
    students: "Number of students",
    interest: "What are you interested in?",
    choose: "Choose one (optional)",
    i: {
      program_only: "Program Only",
      program_live_launch: "Program + Live Launch Day",
      masterclass: "I attended the Masterclass",
      not_sure: "Not sure yet",
    },
    message: "Anything you would like us to know",
    messagePh: "Your goals for students, timing, grade levels, questions.",
    required: "Required",
    send: "Send",
    sending: "Sending…",
    error: "That did not send. Please check your email address and try again.",
  },
  es: {
    name: "Su nombre",
    title: "Su cargo",
    titlePh: "Director, Consejero, Superintendente adjunto",
    school: "Escuela",
    email: "Correo electrónico",
    phone: "Teléfono",
    students: "Número de estudiantes",
    interest: "¿Qué le interesa?",
    choose: "Elija una opción (opcional)",
    i: {
      program_only: "Solo el programa",
      program_live_launch: "Programa + Día de lanzamiento en vivo",
      masterclass: "Asistí a la Masterclass",
      not_sure: "Aún no lo sé",
    },
    message: "Algo que quiera contarnos",
    messagePh: "Sus objetivos para los estudiantes, fechas, grados, preguntas.",
    required: "Obligatorio",
    send: "Enviar",
    sending: "Enviando…",
    error: "No se pudo enviar. Revise su correo electrónico e inténtelo de nuevo.",
  },
} as const;

const input =
  "mt-1.5 w-full rounded-xl border border-brand-deep/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold/60 focus:outline-none";
const lbl = "text-xs font-bold uppercase tracking-widest text-ink/65";

export function SchoolForm({
  locale,
  thanks,
  from,
}: {
  locale: Locale;
  thanks: string;
  from: string | null;
}) {
  const c = COPY[locale];
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/v1/schools/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: f.get("contactName"),
          contactTitle: f.get("contactTitle"),
          schoolName: f.get("schoolName"),
          email: f.get("email"),
          phone: f.get("phone"),
          studentCount: f.get("studentCount") ? Number(f.get("studentCount")) : null,
          interest: f.get("interest") || null,
          message: f.get("message"),
          locale,
          source: from ?? "schools-page",
          website: f.get("website"),
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="glass rounded-3xl p-8 text-center sm:p-10">
        <p className="font-display text-3xl font-black text-brand-deep">Be Great!</p>
        <p className="mx-auto mt-3 max-w-lg text-lg leading-relaxed text-ink/75">{thanks}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass relative grid gap-5 rounded-3xl p-6 sm:p-8 md:grid-cols-2">
      <label className="block">
        <span className={lbl}>{c.name} *</span>
        <input name="contactName" required maxLength={200} autoComplete="name" className={input} />
      </label>
      <label className="block">
        <span className={lbl}>{c.title}</span>
        <input name="contactTitle" maxLength={200} placeholder={c.titlePh} autoComplete="organization-title" className={input} />
      </label>
      <label className="block md:col-span-2">
        <span className={lbl}>{c.school} *</span>
        <input name="schoolName" required maxLength={300} autoComplete="organization" className={input} />
      </label>
      <label className="block">
        <span className={lbl}>{c.email} *</span>
        <input name="email" type="email" required maxLength={255} autoComplete="email" className={input} />
      </label>
      <label className="block">
        <span className={lbl}>{c.phone}</span>
        <input name="phone" type="tel" maxLength={50} autoComplete="tel" className={input} />
      </label>
      <label className="block">
        <span className={lbl}>{c.students}</span>
        <input name="studentCount" type="number" min={0} max={100000} inputMode="numeric" className={input} />
      </label>
      <label className="block">
        <span className={lbl}>{c.interest}</span>
        <select name="interest" defaultValue={from === "masterclass" ? "masterclass" : ""} className={input}>
          <option value="">{c.choose}</option>
          {(Object.keys(c.i) as (keyof typeof c.i)[]).map((k) => (
            <option key={k} value={k}>{c.i[k]}</option>
          ))}
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className={lbl}>{c.message}</span>
        <textarea name="message" rows={4} maxLength={5000} placeholder={c.messagePh} className={input} />
      </label>
      {/* Left empty by people, filled in by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {state === "error" && (
        <p role="alert" className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {c.error}
        </p>
      )}
      <div className="md:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-6 py-4 font-bold text-ink ring-cta transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {state === "sending" ? c.sending : c.send}
        </button>
        <span className="text-xs text-ink/55">* {c.required}</span>
      </div>
    </form>
  );
}
