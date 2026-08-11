import { Nav } from "@/components/Nav";
import { t, isLocale, type Locale } from "@/i18n/copy";
import { db, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

interface SessionRow {
  id: string;
  starts_at: string;
  capacity: number | null;
  status: string;
  event: { title: string } | { title: string }[] | null;
}

interface RegistrationRow {
  id: string;
  registered_at: string;
  status: string;
  person: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
  child_profile: { first_name: string; age_band: number | null } | { first_name: string; age_band: number | null }[] | null;
}

interface ExceptionRow {
  id: string;
  area: string;
  severity: string;
  summary: string;
  created_at: string;
}

/** Supabase types an embedded relation as object-or-array depending on the join. */
function one<T>(v: T | T[] | null): T | null {
  if (v === null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function fmt(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const c = t(locale).admin;

  const ready = isDatabaseConfigured();

  let sessions: SessionRow[] = [];
  let registrations: RegistrationRow[] = [];
  let exceptions: ExceptionRow[] = [];
  let counts: Record<string, number> = {};

  if (ready) {
    const [s, r, e] = await Promise.all([
      db
        .from("event_session")
        .select("id, starts_at, capacity, status, event(title)")
        .in("status", ["scheduled", "live"])
        .order("starts_at", { ascending: true })
        .limit(10),
      db
        .from("registration")
        .select("id, registered_at, status, person(full_name, email), child_profile(first_name, age_band)")
        .order("registered_at", { ascending: false })
        .limit(25),
      db
        .from("exception_item")
        .select("id, area, severity, summary, created_at")
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    sessions = (s.data as SessionRow[] | null) ?? [];
    registrations = (r.data as RegistrationRow[] | null) ?? [];
    exceptions = (e.data as ExceptionRow[] | null) ?? [];

    // Registration count per session, so a session row can show how full it is.
    for (const sess of sessions) {
      const { count } = await db
        .from("registration")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sess.id)
        .eq("status", "confirmed");
      counts[sess.id] = count ?? 0;
    }
  }

  return (
    <>
      <Nav locale={locale} current="admin" />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0b1b3a]">{c.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#12224a]/80">{c.lede}</p>

        {!ready && (
          <div className="mt-10 rounded-2xl border-2 border-[#f5a524]/40 bg-[#fffaf0] p-8">
            <h2 className="text-lg font-bold text-[#0b1b3a]">{c.locked}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#12224a]/80">{c.lockedBody}</p>
          </div>
        )}

        {/* Sessions */}
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            {c.upcoming}
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#0b1b3a]/10 bg-white">
            {sessions.length === 0 ? (
              <p className="p-6 text-sm text-[#12224a]/50">{c.noSessions}</p>
            ) : (
              <ul className="divide-y divide-[#0b1b3a]/10">
                {sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-5">
                    <span className="font-semibold text-[#0b1b3a]">
                      {one(s.event)?.title ?? "—"}
                    </span>
                    <span className="text-sm text-[#12224a]/65">
                      {c.starts} {fmt(s.starts_at, locale)} UTC
                    </span>
                    <span className="ml-auto text-sm tabular-nums text-[#12224a]/65">
                      {counts[s.id] ?? 0} {c.registered}
                      {s.capacity ? ` / ${s.capacity} ${c.capacity}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Registrations */}
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            {c.registrations}
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#0b1b3a]/10 bg-white">
            {registrations.length === 0 ? (
              <p className="p-6 text-sm text-[#12224a]/50">{c.noRegistrations}</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f4f6fb] text-xs uppercase tracking-wide text-[#12224a]/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">{c.guardian}</th>
                    <th className="px-5 py-3 font-semibold">{c.child}</th>
                    <th className="px-5 py-3 font-semibold">{c.when}</th>
                    <th className="px-5 py-3 font-semibold">{c.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0b1b3a]/10">
                  {registrations.map((r) => {
                    const p = one(r.person);
                    const ch = one(r.child_profile);
                    return (
                      <tr key={r.id}>
                        <td className="px-5 py-3">
                          <span className="font-medium text-[#0b1b3a]">{p?.full_name ?? "—"}</span>
                          <span className="block text-xs text-[#12224a]/55">{p?.email ?? ""}</span>
                        </td>
                        <td className="px-5 py-3 text-[#12224a]/80">
                          {ch ? `${ch.first_name}${ch.age_band ? `, ${ch.age_band}` : ""}` : "—"}
                        </td>
                        <td className="px-5 py-3 text-[#12224a]/70">
                          {fmt(r.registered_at, locale)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Exceptions */}
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            {c.exceptions}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#12224a]/70">
            {c.exceptionsLede}
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#0b1b3a]/10 bg-white">
            {exceptions.length === 0 ? (
              <p className="flex items-center gap-3 p-6 text-sm text-[#12224a]/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {c.noExceptions}
              </p>
            ) : (
              <ul className="divide-y divide-[#0b1b3a]/10">
                {exceptions.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 p-5">
                    <span
                      className={
                        "rounded-md px-2 py-0.5 text-xs font-semibold " +
                        (e.severity === "critical"
                          ? "bg-red-50 text-red-700"
                          : e.severity === "warning"
                            ? "bg-[#fffaf0] text-[#8a5a00]"
                            : "bg-[#f4f6fb] text-[#2563eb]")
                      }
                    >
                      {e.severity}
                    </span>
                    <span className="font-medium text-[#0b1b3a]">{e.summary}</span>
                    <span className="text-xs text-[#12224a]/55">{e.area}</span>
                    <span className="ml-auto text-xs text-[#12224a]/55">
                      {fmt(e.created_at, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
