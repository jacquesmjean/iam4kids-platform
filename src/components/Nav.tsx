import Link from "next/link";
import { t, other, type Locale } from "@/i18n/copy";

export function Nav({ locale, current }: { locale: Locale; current: string }) {
  const c = t(locale).nav;

  const items = [
    { href: `/${locale}`, label: c.foundation, key: "foundation" },
    { href: `/${locale}/schools`, label: c.schools, key: "schools" },
    { href: `/${locale}/register`, label: c.register, key: "register" },
    { href: `/${locale}/impact`, label: c.impact, key: "impact" },
    { href: `/${locale}/content`, label: c.content, key: "content" },
  ];

  // Swap the locale segment, keep the page. A language switch that dumps you
  // back on the home page is a language switch nobody uses twice.
  const swapped = current === "foundation" ? `/${other(locale)}` : `/${other(locale)}/${current === "admin" ? "login" : current}`;

  return (
    <nav className="sticky top-0 z-20 border-b border-[#0b1b3a]/10 bg-[#fdf9f2]/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-6 py-3 text-sm">
        {items.map((i) => (
          <Link
            key={i.key}
            href={i.href}
            className={
              "shrink-0 rounded-md px-3 py-1.5 font-medium transition " +
              (i.key === current
                ? "bg-[#0b1b3a] text-white"
                : "text-[#12224a]/70 hover:bg-[#0b1b3a]/5 hover:text-[#0b1b3a]")
            }
          >
            {i.label}
          </Link>
        ))}

        <Link
          href={`/${locale}/feedback`}
          className={
            "ml-auto shrink-0 rounded-md px-3 py-1.5 font-semibold transition " +
            (current === "feedback"
              ? "bg-[#f5a524] text-[#0b1b3a]"
              : "border border-[#f5a524]/60 bg-[#fffaf0] text-[#8a5a00] hover:border-[#f5a524]")
          }
        >
          {c.feedback}
        </Link>

        {/* The way in for Mark and his team. Sends anyone not signed in to sign in. */}
        <Link
          href={`/${locale}/admin`}
          className={
            "shrink-0 rounded-md px-3 py-1.5 font-semibold transition " +
            (current === "admin" ? "bg-[#0b1b3a] text-white" : "text-[#0b1b3a] hover:bg-[#0b1b3a]/5")
          }
        >
          {c.admin}
        </Link>

        <Link
          href={swapped}
          className="shrink-0 rounded-md border border-[#0b1b3a]/15 px-3 py-1.5 font-semibold text-[#0b1b3a] transition hover:border-[#0b1b3a]/40"
        >
          {c.switch}
        </Link>
      </div>
    </nav>
  );
}
