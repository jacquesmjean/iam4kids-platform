import type { Locale } from "@/i18n/copy";

/**
 * Footer on every public page: terms, privacy, and "Powered by TechFides"
 * in the TechFides colour, linking home.
 *
 * The legal pages live on the public site, where they were drafted. They are
 * drafts awaiting I AM 4 Kids' attorney, and they are linked from one place
 * so that when the reviewed versions land, one URL changes.
 */
const LEGAL_BASE = "https://iam4kids-os.vercel.app";

const COPY = {
  en: { terms: "Terms of Use", privacy: "Privacy Policy", powered: "Powered by" },
  es: { terms: "Términos de uso", privacy: "Política de privacidad", powered: "Con tecnología de" },
} as const;

export function SiteFooter({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  return (
    <footer className="mt-24 border-t border-[#0b1b3a]/10 bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-8 text-sm text-[#12224a]/70">
        <span>© {new Date().getFullYear()} I AM 4 Kids</span>
        <a href={`${LEGAL_BASE}/${locale}/legal/terms`} className="underline-offset-4 hover:text-[#0b1b3a] hover:underline">
          {c.terms}
        </a>
        <a href={`${LEGAL_BASE}/${locale}/legal/privacy`} className="underline-offset-4 hover:text-[#0b1b3a] hover:underline">
          {c.privacy}
        </a>
        <a
          href="https://techfides.com"
          target="_blank"
          rel="noopener"
          className="ml-auto font-semibold"
        >
          <span className="text-[#12224a]/60">{c.powered} </span>
          <span className="text-[#0EA5E9]">TechFides</span>
        </a>
      </div>
    </footer>
  );
}
