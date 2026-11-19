import { Concierge } from "./Concierge";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import type { SiteLocale } from "./copy";

/** Header, footer and chat around every public page. */
export function SiteShell({ locale, children }: { locale: SiteLocale; children: React.ReactNode }) {
  return (
    <div className="font-body grain min-h-dvh">
      <div className="theme-light">
        <SiteHeader locale={locale} />
        <main id="main" className="pt-24">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <Concierge locale={locale} />
      </div>
    </div>
  );
}
