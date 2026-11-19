import { publicDb } from "@/lib/public-db";
import type { Locale } from "@/i18n/copy";

/**
 * Page wording that staff edit from the console (table: site_block).
 *
 * Read with the publishable key; the wording is public by definition.
 * If a Spanish value is empty and the English one is not, the English one
 * is used, so a note Mark writes only in English still appears on /es
 * rather than leaving a hole in the page.
 */
export type Blocks = Record<string, string>;

export async function getBlocks(page: string, locale: Locale): Promise<Blocks> {
  const db = publicDb();
  if (!db) return {};

  const { data, error } = await db
    .from("site_block")
    .select("key, locale, value")
    .eq("page", page);

  if (error || !data) return {};

  const en: Blocks = {};
  const mine: Blocks = {};
  for (const row of data as { key: string; locale: string; value: string }[]) {
    if (row.locale === "en") en[row.key] = row.value;
    if (row.locale === locale) mine[row.key] = row.value;
  }

  const out: Blocks = {};
  for (const key of new Set([...Object.keys(en), ...Object.keys(mine)])) {
    const v = (mine[key] ?? "").trim();
    out[key] = v.length ? v : (en[key] ?? "").trim();
  }
  return out;
}

/** Split on blank lines into paragraphs. */
export function paragraphs(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
