"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site, type SiteLocale } from "./copy";

const Sparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
  </svg>
);
const Menu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
export const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

export function SiteHeader({ locale }: { locale: SiteLocale }) {
  const t = site(locale);
  const [open, setOpen] = useState(false);
  const path = usePathname() ?? `/${locale}`;
  const links = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/families`, label: t.nav.families },
    { href: `/${locale}/schools`, label: t.nav.schools },
    { href: `/${locale}/movement`, label: t.nav.movement },
    { href: `/${locale}/vision`, label: t.nav.vision },
    { href: `/${locale}/founder`, label: t.nav.founder },
  ];
  const other = locale === "en" ? "es" : "en";
  const swapped = path.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-3 rounded-2xl glass-strong px-4 py-3 sm:mx-4 lg:mx-auto">
        <Link href={`/${locale}`} className="flex items-center gap-2" aria-label={t.a11y.home}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-deep font-display text-lg font-black text-white shadow-lg">I</span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            AM <span className="text-gold-deep">4</span> Kids
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-brand/10 text-gold-deep" : "text-ink/75 hover:bg-brand/10 hover:text-ink")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={swapped}
            aria-label={t.a11y.switchLang}
            className="rounded-lg border border-brand-deep/20 px-2.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink/80 transition hover:border-gold-deep/60 hover:text-gold-deep"
          >
            {other.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-4 py-2 text-sm font-bold text-ink ring-cta transition hover:brightness-110 sm:flex"
          >
            <Sparkles />
            {t.nav.contact}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
          >
            {open ? <XIcon /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="mx-3 mt-2 flex flex-col gap-1 rounded-2xl glass-strong p-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink/80 hover:bg-brand/10 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/contact`}
            onClick={() => setOpen(false)}
            className="mt-1 rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-3 py-3 text-center font-bold text-ink"
          >
            {t.nav.contact}
          </Link>
        </nav>
      )}
    </header>
  );
}
