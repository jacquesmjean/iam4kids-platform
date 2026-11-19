import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { DEFAULT_ZONE, ZONES, formatWhen, isPast, utcToZoned } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { addSession, saveEvent, updateSession } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, field, first, label, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

interface Session {
  id: string;
  starts_at: string;
  duration_mins: number;
  capacity: number | null;
  delivery: string;
  join_url: string | null;
  status: string;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  kind: string;
  audience: string | null;
  description: string | null;
  is_free: boolean;
  price_cents: number | null;
  event_session: Session[];
}

const KINDS = [
  ["family_reset", "Be Great! Family Reset"],
  ["educator_masterclass", "Masterclass for educators or school leaders"],
  ["family_pack", "Family Pack cohort"],
  ["academy", "Academy session"],
  ["assembly", "School assembly"],
  ["professional_development", "Professional development"],
  ["before_the_bell", "Before the Bell"],
  ["webinar", "Webinar"],
  ["media", "Media or podcast"],
  ["community", "Community event"],
] as const;

const AUDIENCES = [
  ["families", "Families"],
  ["schools", "Schools"],
  ["educators", "Educators"],
  ["mixed", "Everyone"],
] as const;

const SESSION_STATUS = [
  ["scheduled", "Open for registration"],
  ["draft", "Draft (hidden)"],
  ["live", "Happening now"],
  ["completed", "Done"],
  ["cancelled", "Cancelled"],
] as const;

/** Public pages that register for an event, by slug. */
const PUBLIC_PAGE: Record<string, string> = { "be-great-family-reset": "register" };

function SessionFields({ s }: { s?: Session }) {
  const when = s ? utcToZoned(s.starts_at, DEFAULT_ZONE) : { date: "", time: "19:00" };
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <label className="block lg:col-span-1">
        <span className={label}>Date</span>
        <input type="date" name="date" defaultValue={when.date} required className={`mt-1 ${field}`} />
      </label>
      <label className="block">
        <span className={label}>Start time</span>
        <input type="time" name="time" defaultValue={when.time} required className={`mt-1 ${field}`} />
      </label>
      <label className="block">
        <span className={label}>Time zone</span>
        <select name="zone" defaultValue={DEFAULT_ZONE} className={`mt-1 ${field}`}>
          {ZONES.map((z) => (
            <option key={z.id} value={z.id}>{z.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>Minutes</span>
        <input type="number" name="duration" min={15} max={600} defaultValue={s?.duration_mins ?? 60} className={`mt-1 ${field}`} />
      </label>
      <label className="block">
        <span className={label}>Seats</span>
        <input type="number" name="capacity" min={1} defaultValue={s?.capacity ?? ""} placeholder="No limit" className={`mt-1 ${field}`} />
      </label>
      <label className="block">
        <span className={label}>Status</span>
        <select name="status" defaultValue={s?.status ?? "scheduled"} className={`mt-1 ${field}`}>
          {SESSION_STATUS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2 lg:col-span-5">
        <span className={label}>Zoom or join link</span>
        <input type="url" name="join_url" defaultValue={s?.join_url ?? ""} placeholder="https://zoom.us/j/..." className={`mt-1 ${field}`} />
      </label>
      <input type="hidden" name="delivery" value={s?.delivery ?? "zoom"} />
    </div>
  );
}

export default async function EventsEditor({
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

  const { data } = await staff.db
    .from("event")
    .select("id, slug, title, kind, audience, description, is_free, price_cents, event_session(id, starts_at, duration_mins, capacity, delivery, join_url, status)")
    .order("created_at");
  const events = (data as EventRow[] | null) ?? [];

  const sessionIds = events.flatMap((e) => e.event_session.map((s) => s.id));
  const counts: Record<string, number> = {};
  if (sessionIds.length) {
    const { data: regs } = await staff.db.from("registration").select("session_id").in("session_id", sessionIds).eq("status", "confirmed");
    for (const r of (regs as { session_id: string }[] | null) ?? []) counts[r.session_id] = (counts[r.session_id] ?? 0) + 1;
  }

  return (
    <>
      <ScreenHeader
        title="Events"
        lede="Set dates, seats and Zoom links yourself. A date marked Open for registration appears on the public page straight away, and families can sign up for it. Times are entered in the time zone you pick and shown to each family in theirs."
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <details className="mt-8 rounded-2xl border border-dashed border-[#0b1b3a]/25 bg-white/70 p-5">
        <summary className="cursor-pointer font-semibold text-[#0b1b3a]">+ Create a new event</summary>
        <form action={saveEvent} className="mt-4 grid gap-3 md:grid-cols-2">
          <Locale locale={locale} />
          <label className="block md:col-span-2">
            <span className={label}>Name</span>
            <input name="title" required placeholder="School Leaders Masterclass" className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className={label}>Kind</span>
            <select name="kind" defaultValue="educator_masterclass" className={`mt-1 ${field}`}>
              {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={label}>For</span>
            <select name="audience" defaultValue="schools" className={`mt-1 ${field}`}>
              {AUDIENCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className={label}>Description</span>
            <textarea name="description" rows={3} className={`mt-1 ${field}`} />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#0b1b3a]">
            <input type="checkbox" name="is_free" defaultChecked /> Free
          </label>
          <label className="block">
            <span className={label}>Price in dollars, if paid</span>
            <input name="price" type="number" min={0} step="0.01" className={`mt-1 ${field}`} />
          </label>
          <div className="md:col-span-2">
            <SubmitButton>Create event</SubmitButton>
          </div>
        </form>
      </details>

      <div className="mt-8 space-y-8">
        {events.length === 0 && <Empty>No events yet.</Empty>}
        {events.map((e) => {
          const sessions = [...e.event_session].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          const upcoming = sessions.filter((s) => !isPast(s.starts_at));
          const past = sessions.filter((s) => isPast(s.starts_at));
          const page = PUBLIC_PAGE[e.slug];
          return (
            <article key={e.id} id={`e-${e.id}`} className="scroll-mt-8 overflow-hidden rounded-2xl border border-[#0b1b3a]/10 bg-white shadow-sm">
              <header className="flex flex-wrap items-center gap-3 border-b border-[#0b1b3a]/10 px-6 py-4">
                <h2 className="text-xl font-bold text-[#0b1b3a]">{e.title}</h2>
                <Pill tone="blue">{AUDIENCES.find(([v]) => v === e.audience)?.[1] ?? "Everyone"}</Pill>
                <Pill tone={e.is_free ? "green" : "gold"}>{e.is_free ? "Free" : `$${((e.price_cents ?? 0) / 100).toFixed(2)}`}</Pill>
                {page && (
                  <Link href={`/${locale}/${page}`} target="_blank" className="ml-auto text-sm font-semibold text-[#2563eb] hover:underline">
                    Public registration page ↗
                  </Link>
                )}
              </header>

              <div className="px-6 py-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">Dates</h3>
                {upcoming.length === 0 && (
                  <p className="mt-3 rounded-lg bg-[#fffaf0] px-4 py-3 text-sm text-[#8a5a00]">
                    No future date. Add one below and registration opens for it.
                  </p>
                )}
                <div className="mt-3 space-y-4">
                  {upcoming.map((s) => (
                    <form key={s.id} action={updateSession} className="rounded-xl border border-[#0b1b3a]/10 bg-[#fbfaf7] p-4">
                      <Locale locale={locale} />
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="event_id" value={e.id} />
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-[#0b1b3a]">{formatWhen(s.starts_at)}</p>
                        <span className="text-sm text-[#12224a]/65">
                          {counts[s.id] ?? 0} registered{s.capacity ? ` of ${s.capacity}` : ""}
                        </span>
                      </div>
                      <SessionFields s={s} />
                      <div className="mt-3">
                        <SubmitButton variant="secondary">Save this date</SubmitButton>
                      </div>
                    </form>
                  ))}
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#2563eb]">+ Add a date</summary>
                  <form action={addSession} className="mt-3 rounded-xl border border-dashed border-[#0b1b3a]/25 p-4">
                    <Locale locale={locale} />
                    <input type="hidden" name="event_id" value={e.id} />
                    <SessionFields />
                    <div className="mt-3">
                      <SubmitButton>Add date</SubmitButton>
                    </div>
                  </form>
                </details>

                {past.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-[#12224a]/60">
                      {past.length} past date{past.length === 1 ? "" : "s"}
                    </summary>
                    <ul className="mt-2 space-y-1 text-sm text-[#12224a]/70">
                      {past.map((s) => (
                        <li key={s.id}>
                          {formatWhen(s.starts_at)}, {counts[s.id] ?? 0} registered,{" "}
                          {SESSION_STATUS.find(([v]) => v === s.status)?.[1]}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>

              <details className="border-t border-[#0b1b3a]/10 px-6 py-4">
                <summary className="cursor-pointer text-sm font-semibold text-[#0b1b3a]">Edit name, description and price</summary>
                <form action={saveEvent} className="mt-4 grid gap-3 md:grid-cols-2">
                  <Locale locale={locale} />
                  <input type="hidden" name="id" value={e.id} />
                  <label className="block md:col-span-2">
                    <span className={label}>Name</span>
                    <input name="title" defaultValue={e.title} required className={`mt-1 ${field}`} />
                  </label>
                  <label className="block">
                    <span className={label}>Kind</span>
                    <select name="kind" defaultValue={e.kind} className={`mt-1 ${field}`}>
                      {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className={label}>For</span>
                    <select name="audience" defaultValue={e.audience ?? "mixed"} className={`mt-1 ${field}`}>
                      {AUDIENCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                  <label className="block md:col-span-2">
                    <span className={label}>Description shown to families</span>
                    <textarea name="description" rows={3} defaultValue={e.description ?? ""} className={`mt-1 ${field}`} />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#0b1b3a]">
                    <input type="checkbox" name="is_free" defaultChecked={e.is_free} /> Free
                  </label>
                  <label className="block">
                    <span className={label}>Price in dollars, if paid</span>
                    <input name="price" type="number" min={0} step="0.01" defaultValue={e.price_cents ? e.price_cents / 100 : ""} className={`mt-1 ${field}`} />
                  </label>
                  <div className="md:col-span-2">
                    <SubmitButton>Save event</SubmitButton>
                  </div>
                </form>
              </details>
            </article>
          );
        })}
      </div>
    </>
  );
}
