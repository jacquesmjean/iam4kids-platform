import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatShort, formatWhen } from "@/lib/time";
import { markAllNotificationsRead } from "./actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, first, type SearchParams } from "./ui";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  created_at: string;
  read_at: string | null;
}

interface SessionRow {
  id: string;
  starts_at: string;
  capacity: number | null;
  status: string;
  event: { title: string; slug: string } | { title: string; slug: string }[] | null;
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

function one<T>(v: T | T[] | null): T | null {
  if (v === null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const KIND_LABEL: Record<string, string> = {
  feedback: "Feedback",
  school_inquiry: "School",
  inquiry: "Inquiry",
  concierge: "Chat",
  registration: "Registration",
  decision_answered: "Decision",
  system: "System",
};

export default async function ConsoleOverview({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const sp = await searchParams;
  const staff = await requireStaff(locale);
  const db = staff.db;

  const head = { count: "exact" as const, head: true };
  const nowIso = new Date().toISOString();

  const [notes, decisions, feedback, schools, others, sessions, registrations, exceptions] = await Promise.all([
    db.from("staff_notification").select("id, kind, title, body, link, created_at, read_at").order("created_at", { ascending: false }).limit(15),
    db.from("decision_request").select("id", head).eq("status", "open"),
    db.from("client_feedback").select("id", head).is("read_at", null),
    db.from("school_inquiry").select("id", head).eq("status", "new"),
    db.from("inquiry").select("id", head).eq("status", "new"),
    db.from("event_session").select("id, starts_at, capacity, status, event(title, slug)").in("status", ["scheduled", "live"]).gte("starts_at", nowIso).order("starts_at").limit(10),
    db.from("registration").select("id, registered_at, status, person(full_name, email), child_profile(first_name, age_band)").order("registered_at", { ascending: false }).limit(15),
    db.from("exception_item").select("id, area, severity, summary, created_at").is("resolved_at", null).order("created_at", { ascending: false }).limit(10),
  ]);

  const notifications = (notes.data as Notification[] | null) ?? [];
  const unread = notifications.filter((n) => !n.read_at).length;
  const upcoming = (sessions.data as SessionRow[] | null) ?? [];
  const regs = (registrations.data as RegistrationRow[] | null) ?? [];
  const fails = (exceptions.data as ExceptionRow[] | null) ?? [];

  const counts: Record<string, number> = {};
  await Promise.all(
    upcoming.map(async (s) => {
      const { count } = await db.from("registration").select("id", head).eq("session_id", s.id).eq("status", "confirmed");
      counts[s.id] = count ?? 0;
    })
  );

  const next = upcoming[0];
  const firstName = staff.fullName.split(" ")[0];

  const cards = [
    {
      href: "/decisions",
      n: decisions.count ?? 0,
      label: "Decisions waiting on you",
      none: "Nothing waiting on you",
    },
    { href: "/feedback", n: feedback.count ?? 0, label: "Unread feedback", none: "All feedback read" },
    {
      href: (schools.count ?? 0) > 0 || (others.count ?? 0) === 0 ? "/schools" : "/inquiries",
      n: (schools.count ?? 0) + (others.count ?? 0),
      label: "New inquiries",
      none: "No new inquiries",
    },
  ];

  return (
    <>
      <ScreenHeader
        title={`Welcome, ${firstName}.`}
        lede="Everything that needs a person shows up here first. Change your pages, set event dates and answer decisions from the tabs above. Nothing you do here needs an email to TechFides."
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={`/${locale}/admin${c.href}`}
            className="rounded-2xl border border-[#0b1b3a]/10 bg-white p-5 shadow-sm transition hover:border-[#0b1b3a]/30"
          >
            <p className={"text-3xl font-bold tabular-nums " + (c.n > 0 ? "text-[#0b1b3a]" : "text-[#12224a]/30")}>{c.n}</p>
            <p className="mt-1 text-sm font-medium text-[#12224a]/70">{c.n > 0 ? c.label : c.none}</p>
          </Link>
        ))}
        <Link
          href={`/${locale}/admin/events`}
          className="rounded-2xl border border-[#0b1b3a]/10 bg-white p-5 shadow-sm transition hover:border-[#0b1b3a]/30"
        >
          {next ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">Next session</p>
              <p className="mt-1 font-semibold text-[#0b1b3a]">{one(next.event)?.title}</p>
              <p className="text-sm text-[#12224a]/70">{formatWhen(next.starts_at)}</p>
              <p className="mt-1 text-sm text-[#12224a]/70">
                {counts[next.id] ?? 0} registered{next.capacity ? ` of ${next.capacity}` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a5a00]">No date set</p>
              <p className="mt-1 text-sm font-medium text-[#12224a]/80">
                Set the next Family Reset date and registration opens on its own.
              </p>
            </>
          )}
        </Link>
      </section>

      {/* Notifications */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end gap-3">
          <h2 className="text-lg font-bold text-[#0b1b3a]">Notifications</h2>
          <p className="text-sm text-[#12224a]/60">
            Feedback, inquiries, website chats and answered decisions land here the moment they arrive.
          </p>
          {unread > 0 && (
            <form action={markAllNotificationsRead} className="ml-auto">
              <Locale locale={locale} />
              <SubmitButton variant="secondary" pending="Clearing…">Mark all as read</SubmitButton>
            </form>
          )}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#0b1b3a]/10 bg-white">
          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-[#12224a]/55">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-[#0b1b3a]/10">
              {notifications.map((n) => (
                <li key={n.id} className={"flex flex-wrap items-start gap-x-4 gap-y-1 p-5 " + (n.read_at ? "" : "bg-[#fffaf0]")}>
                  <Pill tone={n.read_at ? "grey" : n.title.startsWith("Urgent") ? "red" : "gold"}>{KIND_LABEL[n.kind] ?? n.kind}</Pill>
                  <div className="min-w-0 flex-1">
                    {n.link ? (
                      <Link href={`/${locale}${n.link}`} className="font-semibold text-[#0b1b3a] hover:underline">
                        {n.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-[#0b1b3a]">{n.title}</p>
                    )}
                    {n.body && <p className="mt-1 line-clamp-2 text-sm text-[#12224a]/70">{n.body}</p>}
                  </div>
                  <span className="text-xs text-[#12224a]/55">{formatShort(n.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Upcoming sessions */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-[#0b1b3a]">Upcoming sessions</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#0b1b3a]/10 bg-white">
          {upcoming.length === 0 ? (
            <p className="p-6 text-sm text-[#12224a]/55">
              No future dates.{" "}
              <Link href={`/${locale}/admin/events`} className="font-semibold text-[#2563eb] hover:underline">
                Add one in Events
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-[#0b1b3a]/10">
              {upcoming.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-5">
                  <span className="font-semibold text-[#0b1b3a]">{one(s.event)?.title ?? "Event"}</span>
                  <span className="text-sm text-[#12224a]/65">{formatWhen(s.starts_at)}</span>
                  <span className="ml-auto text-sm tabular-nums text-[#12224a]/65">
                    {counts[s.id] ?? 0} registered{s.capacity ? ` of ${s.capacity}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Registrations */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-[#0b1b3a]">Latest registrations</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#0b1b3a]/10 bg-white">
          {regs.length === 0 ? (
            <p className="p-6 text-sm text-[#12224a]/55">No registrations yet.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-[#f4f6fb] text-xs uppercase tracking-wide text-[#12224a]/60">
                <tr>
                  <th className="px-5 py-3 font-semibold">Parent</th>
                  <th className="px-5 py-3 font-semibold">Child</th>
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b1b3a]/10">
                {regs.map((r) => {
                  const p = one(r.person);
                  const ch = one(r.child_profile);
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-3">
                        <span className="font-medium text-[#0b1b3a]">{p?.full_name ?? "Unknown"}</span>
                        <span className="block text-xs text-[#12224a]/55">{p?.email ?? ""}</span>
                      </td>
                      <td className="px-5 py-3 text-[#12224a]/80">
                        {ch ? `${ch.first_name}${ch.age_band ? `, ${ch.age_band}` : ""}` : "Not given"}
                      </td>
                      <td className="px-5 py-3 text-[#12224a]/70">{formatShort(r.registered_at)}</td>
                      <td className="px-5 py-3">
                        <Pill tone={r.status === "confirmed" ? "green" : r.status === "waitlisted" ? "gold" : "grey"}>
                          {r.status}
                        </Pill>
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
        <h2 className="text-lg font-bold text-[#0b1b3a]">Things that failed</h2>
        <p className="mt-1 text-sm text-[#12224a]/60">
          A bounced confirmation or a failed registration shows up here, so nobody has to report it.
        </p>
        <div className="mt-4">
          {fails.length === 0 ? (
            <Empty>Nothing failing. This list is meant to be empty.</Empty>
          ) : (
            <ul className="divide-y divide-[#0b1b3a]/10 overflow-hidden rounded-xl border border-[#0b1b3a]/10 bg-white">
              {fails.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 p-5">
                  <Pill tone={e.severity === "critical" ? "red" : e.severity === "warning" ? "gold" : "blue"}>{e.severity}</Pill>
                  <span className="font-medium text-[#0b1b3a]">{e.summary}</span>
                  <span className="text-xs text-[#12224a]/55">{e.area}</span>
                  <span className="ml-auto text-xs text-[#12224a]/55">{formatShort(e.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
