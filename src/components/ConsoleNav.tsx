"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface ConsoleCounts {
  notifications: number;
  feedback: number;
  inquiries: number;
  decisions: number;
  content: number;
}

const TABS: { path: string; label: string; count: keyof ConsoleCounts | null; also?: string[] }[] = [
  { path: "", label: "Overview", count: "notifications" },
  { path: "/feedback", label: "Feedback", count: "feedback" },
  { path: "/inquiries", label: "Inquiries", count: "inquiries" as const, also: ["/schools", "/chats"] },
  { path: "/content", label: "Content", count: "content" },
  { path: "/site", label: "Page editor", count: null },
  { path: "/events", label: "Events", count: null },
  { path: "/atlas", label: "Atlas", count: null },
  { path: "/decisions", label: "Decisions", count: "decisions" },
];

export function ConsoleNav({ locale, counts }: { locale: string; counts: ConsoleCounts }) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  return (
    <nav aria-label="Staff console" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {TABS.map((t) => {
        const href = base + t.path;
        const active =
          t.path === ""
            ? pathname === base
            : pathname.startsWith(href) || (t.also ?? []).some((p) => pathname.startsWith(base + p));
        const n = t.count ? counts[t.count] : 0;
        return (
          <Link
            key={t.path}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (active ? "bg-white text-[#0b1b3a] shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white")
            }
          >
            {t.label}
            {n > 0 && (
              <span
                className={
                  "min-w-5 rounded-full px-1.5 text-center text-xs font-bold tabular-nums " +
                  (active ? "bg-[#f5a524] text-[#0b1b3a]" : "bg-[#f5a524] text-[#0b1b3a]")
                }
              >
                {n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
