/**
 * Small building blocks shared by the console screens. Plain server
 * components; nothing here needs the browser.
 */

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={
        "mt-6 rounded-xl border px-5 py-3.5 text-sm font-medium " +
        (error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800")
      }
    >
      {error ?? ok}
    </div>
  );
}

export function ScreenHeader({ title, lede }: { title: string; lede?: React.ReactNode }) {
  return (
    <header>
      <h1 className="text-3xl font-bold leading-tight text-[#0b1b3a]">{title}</h1>
      {lede && <p className="mt-3 max-w-3xl leading-relaxed text-[#12224a]/75">{lede}</p>}
    </header>
  );
}

export function Locale({ locale }: { locale: string }) {
  return <input type="hidden" name="locale" value={locale} />;
}

export const field =
  "w-full rounded-lg border border-[#0b1b3a]/20 bg-white px-3 py-2 text-sm text-[#0b1b3a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20";

export const label = "text-xs font-semibold uppercase tracking-wide text-[#12224a]/60";

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[#0b1b3a]/20 bg-white/60 p-8 text-center text-sm text-[#12224a]/60">
      {children}
    </p>
  );
}

export function Pill({ tone, children }: { tone: "green" | "gold" | "blue" | "grey" | "red"; children: React.ReactNode }) {
  const t = {
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-[#fff4dc] text-[#8a5a00]",
    blue: "bg-[#eef3ff] text-[#2563eb]",
    grey: "bg-[#f1f3f7] text-[#12224a]/60",
    red: "bg-red-50 text-red-700",
  }[tone];
  return <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}
