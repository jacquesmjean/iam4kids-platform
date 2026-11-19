import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/time";
import { SubmitButton } from "@/components/SubmitButton";
import { saveBlocks } from "../actions";
import { Flash, Locale, ScreenHeader, field, first, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

interface Block {
  key: string;
  locale: "en" | "es";
  page: string;
  label: string;
  help: string | null;
  kind: "text" | "longtext" | "url" | "email";
  value: string;
  sort: number;
  updated_at: string;
  editor: { full_name: string } | { full_name: string }[] | null;
}

const PAGE_NAMES: Record<string, string> = { schools: "Schools page" };

function editorName(b: Block | undefined): string | null {
  if (!b?.editor) return null;
  const e = Array.isArray(b.editor) ? b.editor[0] : b.editor;
  return e?.full_name ?? null;
}

function Input({ b, name }: { b: Block; name: string }) {
  if (b.kind === "longtext") {
    const rows = Math.min(10, Math.max(3, Math.ceil(b.value.length / 70) + b.value.split("\n").length));
    return <textarea name={name} defaultValue={b.value} rows={rows} className={`${field} leading-relaxed`} />;
  }
  return <input name={name} defaultValue={b.value} type={b.kind === "email" ? "email" : b.kind === "url" ? "url" : "text"} className={field} />;
}

export default async function PageEditor({
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
    .from("site_block")
    .select("key, locale, page, label, help, kind, value, sort, updated_at, editor:updated_by(full_name)")
    .order("sort");
  const blocks = (data as Block[] | null) ?? [];

  const pages = [...new Set(blocks.map((b) => b.page))];
  const page = first(sp.page) && pages.includes(first(sp.page)!) ? first(sp.page)! : pages[0] ?? "schools";

  // Pair English and Spanish for each key, in page order.
  const keys: string[] = [];
  const byKey: Record<string, { en?: Block; es?: Block }> = {};
  for (const b of blocks.filter((x) => x.page === page)) {
    if (!byKey[b.key]) {
      byKey[b.key] = {};
      keys.push(b.key);
    }
    byKey[b.key][b.locale] = b;
  }

  return (
    <>
      <ScreenHeader
        title="Page editor"
        lede="Change the words on your pages yourself. Edit the English, the Spanish, or both, then press Save. The page changes immediately. Every change is kept with your name and the date, and any earlier version can be put back from its History link."
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {pages.map((p) => (
          <Link
            key={p}
            href={`/${locale}/admin/site?page=${p}`}
            className={
              "rounded-md px-3 py-1.5 text-sm font-semibold " +
              (p === page ? "bg-[#0b1b3a] text-white" : "border border-[#0b1b3a]/15 bg-white text-[#0b1b3a]")
            }
          >
            {PAGE_NAMES[p] ?? p}
          </Link>
        ))}
        <span className="ml-auto flex gap-3 text-sm">
          <a href={`/en/${page}`} target="_blank" className="font-semibold text-[#2563eb] hover:underline">
            View English page ↗
          </a>
          <a href={`/es/${page}`} target="_blank" className="font-semibold text-[#2563eb] hover:underline">
            View Spanish page ↗
          </a>
        </span>
      </div>

      <form action={saveBlocks} className="mt-6">
        <Locale locale={locale} />
        <input type="hidden" name="page" value={page} />

        <div className="overflow-hidden rounded-2xl border border-[#0b1b3a]/10 bg-white shadow-sm">
          <div className="hidden grid-cols-2 gap-6 border-b border-[#0b1b3a]/10 bg-[#f4f6fb] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#12224a]/60 md:grid">
            <span>English</span>
            <span>Español</span>
          </div>
          <div className="divide-y divide-[#0b1b3a]/10">
            {keys.map((key) => {
              const pair = byKey[key];
              const ref = pair.en ?? pair.es!;
              const changedBy = editorName(pair.en) ?? editorName(pair.es);
              const changedAt = [pair.en, pair.es]
                .filter((b) => b && editorName(b))
                .map((b) => b!.updated_at)
                .sort()
                .pop();
              return (
                <div key={key} className="px-6 py-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="font-semibold text-[#0b1b3a]">{ref.label}</h2>
                    {ref.help && <p className="text-sm text-[#12224a]/60">{ref.help}</p>}
                    <span className="ml-auto text-xs text-[#12224a]/50">
                      {changedBy && changedAt ? `Last changed by ${changedBy}, ${formatShort(changedAt)}. ` : ""}
                      <Link href={`/${locale}/admin/site/history?key=${encodeURIComponent(key)}`} className="font-semibold text-[#2563eb] hover:underline">
                        History
                      </Link>
                    </span>
                  </div>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {(["en", "es"] as const).map((lang) => {
                      const b = pair[lang];
                      if (!b) return <div key={lang} />;
                      return (
                        <label key={lang} className="block">
                          <span className="mb-1 block text-xs font-semibold text-[#12224a]/50 md:hidden">
                            {lang === "en" ? "English" : "Español"}
                          </span>
                          <Input b={b} name={`v::${key}::${lang}`} />
                          <input type="hidden" name={`o::${key}::${lang}`} value={b.value} />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-4 mt-6 flex items-center gap-4 rounded-xl border border-[#0b1b3a]/10 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
          <p className="text-sm text-[#12224a]/70">Only the fields you changed are saved. Nothing goes live until you press Save.</p>
          <SubmitButton className="ml-auto" pending="Saving…">Save changes</SubmitButton>
        </div>
      </form>
    </>
  );
}
