import Link from "next/link";

/** The three inboxes behind the Inquiries tab. */
export function InquiryTabs({ locale, current }: { locale: string; current: "families" | "schools" | "chats" }) {
  const tabs = [
    { id: "families", href: `/${locale}/admin/inquiries`, label: "Families & partners" },
    { id: "schools", href: `/${locale}/admin/schools`, label: "Schools" },
    { id: "chats", href: `/${locale}/admin/chats`, label: "Website chats" },
  ] as const;
  return (
    <div className="mt-6 inline-flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-[#0b1b3a]/10">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={current === t.id ? "page" : undefined}
          className={
            "rounded-lg px-4 py-2 text-sm font-semibold transition " +
            (current === t.id ? "bg-[#0b1b3a] text-white" : "text-[#12224a]/70 hover:bg-[#0b1b3a]/5")
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
