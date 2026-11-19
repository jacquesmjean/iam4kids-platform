import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { isLocale, type Locale } from "@/i18n/copy";
import { publicDb } from "@/lib/public-db";
import { ContentWorkbench } from "./ContentWorkbench";

export const dynamic = "force-dynamic";

/** Mark's approved guardrails from Atlas, via the public read-only function. */
async function guardrails(): Promise<{ title: string; body: string }[]> {
  const db = publicDb();
  if (!db) return [];
  const { data } = await db.rpc("atlas_guardrails");
  return (data as { title: string; body: string }[] | null) ?? [];
}

export default async function ContentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  return (
    <>
      <ContentWorkbench locale={locale} guardrails={await guardrails()} />
      <SiteFooter locale={locale} />
    </>
  );
}
