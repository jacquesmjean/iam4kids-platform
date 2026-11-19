import Link from "next/link";
import { publicDb } from "@/lib/public-db";
import { site, type SiteLocale } from "./copy";

/** The Impact link appears once Mark has approved at least one result. */
async function hasTrackRecord(): Promise<boolean> {
  const db = publicDb();
  if (!db) return false;
  const { data } = await db.rpc("public_track_record");
  return Array.isArray(data) && data.length > 0;
}

const social = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/294541893740548",
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/iam4kidsfoundation",
    icon: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/iam4kidsmedia",
    icon: (
      <>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </>
    ),
  },
  {
    label: "X",
    href: "https://www.x.com/iam4kids_com",
    icon: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />,
  },
];

export async function SiteFooter({ locale }: { locale: SiteLocale }) {
  const t = site(locale);
  const showImpact = await hasTrackRecord();
  const explore = [
    [`/${locale}/families`, t.nav.families],
    [`/${locale}/schools`, t.nav.schools],
    [`/${locale}/movement`, t.nav.movement],
    [`/${locale}/vision`, t.nav.vision],
    [`/${locale}/founder`, t.nav.founder],
    ...(showImpact ? [[`/${locale}/impact`, t.nav.impact]] : []),
    [`/${locale}/contact`, t.footer.contact],
  ];
  const legal = [
    [`/${locale}/legal/terms`, t.footer.terms],
    [`/${locale}/legal/privacy`, t.footer.privacy],
    [`/${locale}/login`, t.nav.admin],
  ];

  return (
    <footer className="relative mt-24 border-t border-brand-deep/15 bg-white/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-bold text-ink">
            I AM <span className="text-gold-deep">4</span> Kids
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/65">{t.footer.tagline}</p>
          <div className="mt-5 flex gap-3">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="rounded-lg border border-brand-deep/15 p-2 text-ink/65 transition hover:border-gold/50 hover:text-gold-deep"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
        <nav aria-label={t.footer.explore}>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-deep/90">{t.footer.explore}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink/65">
            {explore.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.legal}>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-deep/90">{t.footer.legal}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink/65">
            {legal.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-brand-deep/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-ink/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} I AM 4 Kids. {t.footer.rights}
          </p>
          <p>
            {t.footer.poweredBy}{" "}
            <a
              href="https://techfides.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-techfides transition hover:brightness-125"
            >
              TechFides
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
