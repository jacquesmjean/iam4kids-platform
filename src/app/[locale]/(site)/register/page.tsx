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
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-deep/90">{locale === "es" ? "Entrenamiento gratuito en vivo" : "Free live training"}</p><h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">{c.title}</h1>
        <p className="mt-3 text-ink/70">{c.subtitle}</p>

        {session ? (
          <>
            <div className="glass mt-8 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-deep">{c.nextSession}</p>
              <p className="mt-2 text-lg font-bold text-ink">{session.title}</p>
              <p className="font-medium text-ink/80">{formatWhen(session.startsAt, locale)}</p>
              {session.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/75">{session.description}</p>
              )}
            </div>
            <RegisterForm locale={locale} slug={SLUG} />
          </>
        ) : (
          <div className="glass-strong mt-8 rounded-3xl p-7">
            <h2 className="text-lg font-bold text-ink">{c.noDateTitle}</h2>
            <p className="mt-2 leading-relaxed text-ink/80">{c.noDateBody}</p>
          </div>
        )}
      </div>
    </>
  );
}
