import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { updateInquiry } from "../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, field, first, label, type SearchParams } from "../ui";
import { InquiryTabs } from "./Tabs";

export const dynamic = "force-dynamic";

interface Inquiry {
  id: string;
  kind: string;
  interest: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  message: string | null;
  locale: string;
  source: string | null;
  status: string;
  staff_note: string | null;
  created_at: string;
}

const STATUS = [
  { id: "new", label: "New", tone: "gold" as const },
  { id: "contacted", label: "Contacted", tone: "blue" as const },
  { id: "in_conversation", label: "In conversation", tone: "blue" as const },
  { id: "won", label: "Won", tone: "green" as const },
  { id: "closed", label: "Closed", tone: "grey" as const },
];

const KIND: Record<string, string> = { parent: "Parent or guardian", agency: "Agency or partner", other: "Other" };
const INTEREST: Record<string, string> = {
  family: "Family Pack",
  roundtable: "Roundtable",
  academy: "Academy",
  webinar: "Free Sunday webinar",
  partner: "Partnership or sponsorship",
  other: "Something else",
};

export default async function Inquiries({
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

  const { data } = await staff.db.from("inquiry").select("*").order("created_at", { ascending: false });
  const rows = (data as Inquiry[] | null) ?? [];
  const order = STATUS.map((s) => s.id);
  rows.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <>
      <ScreenHeader
        title="Inquiries"
        lede={
          <>
            Everyone who fills in the{" "}
            <Link href={`/${locale}/contact`} className="font-semibold text-[#2563eb] hover:underline">
              Get Started
            </Link>{" "}
            form on the website lands here. Schools go to the Schools inbox. Each new one raises a notification the moment
            it arrives. Move it along as you talk, and leave a note so anyone on the team can pick it up.
          </>
        }
      />
      <InquiryTabs locale={locale} current="families" />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <div className="mt-8 space-y-5">
        {rows.length === 0 && (
          <Empty>No family or partner inquiries yet. When someone fills in the Get Started form, it appears here.</Empty>
        )}
        {rows.map((r) => {
          const st = STATUS.find((s) => s.id === r.status) ?? STATUS[0];
          return (
            <article
              key={r.id}
              id={`i-${r.id}`}
              className={
                "scroll-mt-8 rounded-2xl border bg-white p-6 shadow-sm " +
                (r.status === "new" ? "border-[#f5a524]/60" : "border-[#0b1b3a]/10")
              }
            >
              <div className="flex flex-wrap items-start gap-3">
                <Pill tone={st.tone}>{st.label}</Pill>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-[#0b1b3a]">{r.full_name}</h2>
                  <p className="text-sm text-[#12224a]/75">
                    {KIND[r.kind] ?? r.kind}
                    {r.organization ? `, ${r.organization}` : ""}
                  </p>
                </div>
                <span className="text-xs text-[#12224a]/55">{formatShort(r.created_at)} Eastern</span>
              </div>

              <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className={label}>Email</dt>
                  <dd>
                    <a href={`mailto:${r.email}`} className="text-[#2563eb] hover:underline">{r.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className={label}>Phone</dt>
                  <dd className="text-[#12224a]/85">{r.phone ? <a href={`tel:${r.phone}`}>{r.phone}</a> : "Not given"}</dd>
                </div>
                <div>
                  <dt className={label}>Interested in</dt>
                  <dd className="text-[#12224a]/85">{r.interest ? INTEREST[r.interest] ?? r.interest : "Not given"}</dd>
                </div>
                <div>
                  <dt className={label}>Language</dt>
                  <dd className="text-[#12224a]/85">{r.locale === "es" ? "Spanish" : "English"}</dd>
                </div>
              </dl>
              {r.message && (
                <p className="mt-4 whitespace-pre-line rounded-lg bg-[#f6f4ef] p-4 text-sm leading-relaxed text-[#12224a]/85">
                  {r.message}
                </p>
              )}

              <form action={updateInquiry} className="mt-5 grid gap-3 border-t border-[#0b1b3a]/10 pt-5 md:grid-cols-[200px_1fr_auto] md:items-end">
                <Locale locale={locale} />
                <input type="hidden" name="id" value={r.id} />
                <label className="block">
                  <span className={label}>Status</span>
                  <select name="status" defaultValue={r.status} className={`mt-1 ${field}`}>
                    {STATUS.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>Team note</span>
                  <input name="staff_note" defaultValue={r.staff_note ?? ""} maxLength={5000} placeholder="Called on Tuesday, sending the Family Pack details" className={`mt-1 ${field}`} />
                </label>
                <SubmitButton pending="Saving…">Save</SubmitButton>
              </form>
            </article>
          );
        })}
      </div>
    </>
  );
}
