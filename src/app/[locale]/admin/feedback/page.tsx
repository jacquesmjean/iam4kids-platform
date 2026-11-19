import { COPY } from "@/i18n/copy";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { setFeedbackRead } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, first, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

interface FeedbackRow {
  id: string;
  author_name: string;
  author_role: string | null;
  created_at: string;
  read_at: string | null;
  vision_serves: string | null;
  vision_missing: string | null;
  website_likes: string | null;
  website_changes: string | null;
  platform_likes: string | null;
  platform_changes: string | null;
  hopes: string | null;
  go_live_date: string | null;
  go_live_driver: string | null;
  priority: string | null;
  approver: string | null;
  guardrails: string | null;
  channels: string | null;
  anything_else: string | null;
}

// Shown with the exact question each answer was given to, so nobody has to
// guess what "What is working?" was about.
const q = COPY.en.feedback;
const SECTIONS: { title: string; items: { key: keyof FeedbackRow; label: string }[] }[] = [
  {
    title: "The vision",
    items: [
      { key: "vision_serves", label: q.visionServes },
      { key: "vision_missing", label: q.visionMissing },
    ],
  },
  {
    title: "The public site",
    items: [
      { key: "website_likes", label: q.websiteLikes },
      { key: "website_changes", label: q.websiteChanges },
    ],
  },
  {
    title: "The platform",
    items: [
      { key: "platform_likes", label: q.platformLikes },
      { key: "platform_changes", label: q.platformChanges },
      { key: "hopes", label: q.hopes },
    ],
  },
  {
    title: "Timing",
    items: [
      { key: "go_live_date", label: q.goLiveDate },
      { key: "go_live_driver", label: q.goLiveDriver },
      { key: "priority", label: q.priority },
    ],
  },
  {
    title: "Rules and approvals",
    items: [
      { key: "approver", label: q.approver },
      { key: "guardrails", label: q.guardrails },
      { key: "channels", label: q.channels },
      { key: "anything_else", label: q.anythingElse },
    ],
  },
];

const PRIORITY: Record<string, string> = {
  events: q.pEvents,
  content: q.pContent,
  schools: q.pSchools,
  impact: q.pImpact,
  public_site: q.pPublicSite,
  not_sure: q.pNotSure,
};

function show(row: FeedbackRow, key: keyof FeedbackRow): string | null {
  const v = row[key];
  if (v === null || v === undefined || v === "") return null;
  if (key === "priority") return PRIORITY[String(v)] ?? String(v);
  if (key === "go_live_date") {
    return new Date(`${v}T12:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });
  }
  return String(v);
}

export default async function FeedbackInbox({
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

  const { data } = await staff.db
    .from("client_feedback")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data as FeedbackRow[] | null) ?? [];

  return (
    <>
      <ScreenHeader
        title="Feedback"
        lede="Everything submitted through the review form, word for word. Nobody can edit what was written; you can only mark it as read. Every new submission raises a notification the moment it arrives."
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <div className="mt-8 space-y-8">
        {rows.length === 0 && <Empty>No feedback yet.</Empty>}
        {rows.map((row) => (
          <article
            key={row.id}
            id={`f-${row.id}`}
            className={
              "scroll-mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm " +
              (row.read_at ? "border-[#0b1b3a]/10" : "border-[#f5a524]/60")
            }
          >
            <header className="flex flex-wrap items-center gap-3 border-b border-[#0b1b3a]/10 px-6 py-4">
              {!row.read_at && <Pill tone="gold">Unread</Pill>}
              <h2 className="text-lg font-bold text-[#0b1b3a]">
                {row.author_name}
                {row.author_role && <span className="font-normal text-[#12224a]/60">, {row.author_role}</span>}
              </h2>
              <span className="text-sm text-[#12224a]/60">Submitted {formatShort(row.created_at)} Eastern</span>
              <form action={setFeedbackRead} className="ml-auto">
                <Locale locale={locale} />
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="read" value={row.read_at ? "0" : "1"} />
                <SubmitButton variant={row.read_at ? "quiet" : "primary"} pending="Saving…">
                  {row.read_at ? "Mark as unread" : "Mark as read"}
                </SubmitButton>
              </form>
            </header>

            <div className="divide-y divide-[#0b1b3a]/5">
              {SECTIONS.map((section) => {
                const answered = section.items.filter((i) => show(row, i.key));
                if (answered.length === 0) return null;
                return (
                  <section key={section.title} className="px-6 py-5">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                      {section.title}
                    </h3>
                    <dl className="mt-3 space-y-4">
                      {answered.map((i) => (
                        <div key={i.key}>
                          <dt className="text-sm font-semibold text-[#0b1b3a]">{i.label}</dt>
                          <dd className="mt-1 whitespace-pre-line leading-relaxed text-[#12224a]/85">{show(row, i.key)}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
