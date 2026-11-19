import type { ReactNode } from "react";

export interface SchoolsViewProps {
  /** Page editor wording for this locale, keyed like "schools.title". */
  b: Record<string, string>;
  /** Where the visitor came from, e.g. "masterclass" from the 10 December QR code. */
  from: string | null;
  /** Rendered just after the hero: Masterclass note and opening paragraphs. */
  before: ReactNode;
  /** Rendered just before the form: upcoming events for school leaders. */
  after: ReactNode;
  /** Line above the form. */
  formIntro: ReactNode;
}

/** "$2,500 per school" shows as a big "$2,500" and a small "per school". */
export function priceMain(price: string | undefined): string {
  const p = (price ?? "").trim();
  const i = p.indexOf(" ");
  return i > 0 ? p.slice(0, i) : p;
}
export function priceRest(price: string | undefined): string {
  const p = (price ?? "").trim();
  const i = p.indexOf(" ");
  return i > 0 ? p.slice(i + 1) : "";
}
