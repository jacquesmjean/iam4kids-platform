import type { Metadata } from "next";
import En from "@/site/pages/privacy.en";
import Es from "@/site/pages/privacy.es";

export const metadata: Metadata = { title: "Privacy Policy", description: "How I AM 4 Kids handles personal information." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
