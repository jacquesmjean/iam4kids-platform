import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { t, isLocale, type Locale } from "@/i18n/copy";
import { publicDb } from "@/lib/public-db";
import { formatWhen } from "@/lib/time";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

const SLUG = "be-great-family-reset";

interface NextSession {
  id: string;
  starts_at: string;
  capacity: number | null;
  event: { title: string; description: string | null } | { title: string; description: string | null }[] | null;
}

/**
 * The Be Great! Family Reset registration page.
 *
 * The date, title and description come from the event Mark manages in the
 * staff console. When he adds a date, this page opens; when there is none,
 * it says so instead of taking a registration for a session that does not
 * exist.
 */
async function nextSession() {
  const db = publicDb();
  if (!db) return null;
  const { data } = await db
    .from("event_session")
    .select("id, starts_at, capacity, event!inner(title, description, slug)")
    .eq("event.slug", SLUG)
    .eq("status", "scheduled")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const s = data as NextSession;
  const e = Array.isArray(s.event) ? s.event[0] : s.event;
  return { startsAt: s.starts_at, title: e?.title ?? "Be Great! Family Reset", description: e?.description ?? null };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const c = t(locale).register;
  const session = await nextSession();

  return (
    <>
      <Nav locale={locale} current="register" />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-[#0b1b3a]">{c.title}</h1>
        <p className="mt-3 text-[#12224a]/70">{c.subtitle}</p>

        {session ? (
          <>
            <div className="mt-6 rounded-xl border border-[#2563eb]/20 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">{c.nextSession}</p>
              <p className="mt-2 text-lg font-bold text-[#0b1b3a]">{session.title}</p>
              <p className="font-medium text-[#12224a]/80">{formatWhen(session.startsAt, locale)}</p>
              {session.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#12224a]/75">{session.description}</p>
              )}
            </div>
            <RegisterForm locale={locale} slug={SLUG} />
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-[#f5a524]/40 bg-[#fffaf0] p-6">
            <h2 className="text-lg font-bold text-[#0b1b3a]">{c.noDateTitle}</h2>
            <p className="mt-2 leading-relaxed text-[#12224a]/80">{c.noDateBody}</p>
          </div>
        )}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
