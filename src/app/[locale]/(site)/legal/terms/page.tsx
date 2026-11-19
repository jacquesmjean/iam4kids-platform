import type { Metadata } from "next";
import En from "@/site/pages/terms.en";
import Es from "@/site/pages/terms.es";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms of Use for the I AM 4 Kids website." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
