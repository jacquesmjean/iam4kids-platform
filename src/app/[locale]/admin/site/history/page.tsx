import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { restoreBlock } from "../../actions";
import { Empty, Flash, Locale, Pill, ScreenHeader, first, type SearchParams } from "../../ui";

export const dynamic = "force-dynamic";

interface Revision {
  id: string;
  locale: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  who: { full_name: string } | { full_name: string }[] | null;
}

export default async function BlockHistory({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const sp = await searchParams;
  const key = first(sp.key) ?? "";
  const staff = await requireStaff(locale);

  const [{ data: blocks }, { data: revs }] = await Promise.all([
    staff.db.from("site_block").select("locale, label, value, page").eq("key", key),
    staff.db
      .from("site_block_revision")
      .select("id, locale, old_value, new_value, changed_at, who:changed_by(full_name)")
      .eq("key", key)
      .order("changed_at", { ascending: false }),
  ]);
  const current = (blocks as { locale: string; label: string; value: string; page: string }[] | null) ?? [];
  const revisions = (revs as Revision[] | null) ?? [];
  const labelText = current[0]?.label ?? key;
  const page = current[0]?.page ?? "schools";

  return (
    <>
      <Link href={`/${locale}/admin/site?page=${page}`} className="text-sm font-semibold text-[#2563eb] hover:underline">
        ← Back to the page editor
      </Link>
      <div className="mt-4">
        <ScreenHeader
          title={`History: ${labelText}`}
          lede="Every version this text has had, newest first. Putting an old version back is itself recorded, so nothing is ever lost."
        />
      </div>
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {current.map((c) => (
          <div key={c.locale} className="rounded-2xl border border-[#0b1b3a]/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">
              Live now · {c.locale === "en" ? "English" : "Español"}
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#12224a]/85">
              {c.value || <em className="text-[#12224a]/50">Empty (hidden on the page)</em>}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-[#0b1b3a]">Earlier versions</h2>
        <div className="mt-4 space-y-3">
          {revisions.length === 0 && <Empty>This text has not been changed since it was first set up.</Empty>}
          {revisions.map((r) => {
            const who = Array.isArray(r.who) ? r.who[0] : r.who;
            return (
              <div key={r.id} className="rounded-xl border border-[#0b1b3a]/10 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Pill tone="blue">{r.locale === "en" ? "English" : "Español"}</Pill>
                  <span className="text-[#12224a]/70">
                    Changed by {who?.full_name ?? "someone"} on {formatShort(r.changed_at)}
                  </span>
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#12224a]/50">Before</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-[#12224a]/80">{r.old_value || <em>Empty</em>}</p>
                    <form action={restoreBlock} className="mt-2">
                      <Locale locale={locale} />
                      <input type="hidden" name="key" value={key} />
                      <input type="hidden" name="lang" value={r.locale} />
                      <input type="hidden" name="value" value={r.old_value ?? ""} />
                      <SubmitButton variant="secondary" pending="Restoring…">Put this version back</SubmitButton>
                    </form>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#12224a]/50">After</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-[#12224a]/80">{r.new_value || <em>Empty</em>}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
