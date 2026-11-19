import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { markChatRead } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, first, type SearchParams } from "../ui";
import { InquiryTabs } from "../inquiries/Tabs";

export const dynamic = "force-dynamic";

interface Msg {
  id: string;
  conversation_id: string;
  role: "visitor" | "assistant";
  content: string;
  locale: string;
  flag: string | null;
  page: string | null;
  created_at: string;
}

const FLAG: Record<string, { label: string; tone: "red" | "gold" | "blue" }> = {
  crisis: { label: "Urgent: safety", tone: "red" },
  child: { label: "Sounded like a child", tone: "gold" },
  handoff: { label: "Asked for a person", tone: "blue" },
};

export default async function Chats({
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

  const [{ data }, { data: unread }] = await Promise.all([
    staff.db.from("concierge_message").select("*").order("created_at", { ascending: false }).limit(600),
    staff.db.from("staff_notification").select("subject_id").eq("kind", "concierge").is("read_at", null),
  ]);
  const unreadIds = new Set(((unread as { subject_id: string }[] | null) ?? []).map((u) => u.subject_id));

  const byConv = new Map<string, Msg[]>();
  for (const m of ((data as Msg[] | null) ?? []).slice().reverse()) {
    const list = byConv.get(m.conversation_id) ?? [];
    list.push(m);
    byConv.set(m.conversation_id, list);
  }
  const convs = [...byConv.entries()]
    .map(([id, msgs]) => ({
      id,
      msgs,
      last: msgs[msgs.length - 1].created_at,
      flags: [...new Set(msgs.map((m) => m.flag).filter(Boolean))] as string[],
    }))
    .sort((a, b) => {
      const ua = a.flags.includes("crisis") ? 1 : 0;
      const ub = b.flags.includes("crisis") ? 1 : 0;
      if (ua !== ub) return ub - ua;
      return b.last.localeCompare(a.last);
    });

  return (
    <>
      <ScreenHeader
        title="Inquiries"
        lede="Every conversation with the website chat, word for word. The chat answers only from what is already on the website. A message that sounds like someone in danger gets 911 and 988 straight away and is marked urgent here. A message that sounds like a child is sent to a grown-up."
      />
      <InquiryTabs locale={locale} current="chats" />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <div className="mt-8 space-y-5">
        {convs.length === 0 && <Empty>No chats yet. When a visitor uses Ask us anything on the website, the conversation appears here.</Empty>}
        {convs.map((c) => (
          <article
            key={c.id}
            id={`c-${c.id}`}
            className={
              "scroll-mt-8 rounded-2xl border bg-white p-6 shadow-sm " +
              (c.flags.includes("crisis") ? "border-red-300" : unreadIds.has(c.id) ? "border-[#f5a524]/60" : "border-[#0b1b3a]/10")
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              {c.flags.map((f) => (
                <Pill key={f} tone={FLAG[f]?.tone ?? "grey"}>{FLAG[f]?.label ?? f}</Pill>
              ))}
              {unreadIds.has(c.id) && <Pill tone="gold">Unread</Pill>}
              <span className="text-sm text-[#12224a]/70">
                {c.msgs.filter((m) => m.role === "visitor").length} messages
                {c.msgs[0]?.page ? ` · started on ${c.msgs[0].page}` : ""}
                {c.msgs[0]?.locale === "es" ? " · Spanish" : ""}
              </span>
              <span className="ml-auto text-xs text-[#12224a]/55">{formatShort(c.last)} Eastern</span>
            </div>
            <div className="mt-4 space-y-2">
              {c.msgs.map((m) => (
                <div key={m.id} className={"flex " + (m.role === "visitor" ? "justify-start" : "justify-end")}>
                  <p
                    className={
                      "max-w-[85%] whitespace-pre-line rounded-xl px-3.5 py-2 text-sm leading-relaxed " +
                      (m.role === "visitor" ? "bg-[#f6f4ef] text-[#0b1b3a]" : "bg-[#eef4ff] text-[#12224a]/80")
                    }
                  >
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-[#12224a]/45">
                      {m.role === "visitor" ? "Visitor" : "Chat answered"}
                    </span>
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
            {unreadIds.has(c.id) && (
              <form action={markChatRead} className="mt-4 border-t border-[#0b1b3a]/10 pt-4">
                <Locale locale={locale} />
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton variant="secondary" pending="Saving…">Mark as read</SubmitButton>
              </form>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
