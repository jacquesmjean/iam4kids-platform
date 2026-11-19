import type { Metadata } from "next";
import En from "@/site/pages/founder.en";
import Es from "@/site/pages/founder.es";

export const metadata: Metadata = { title: "Meet Mark Papadas", description: "Mark Papadas is an award-winning speaker, author and the founder of I AM 4 Kids." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
