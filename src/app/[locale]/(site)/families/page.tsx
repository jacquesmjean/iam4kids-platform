import type { Metadata } from "next";
import En from "@/site/pages/families.en";
import Es from "@/site/pages/families.es";

export const metadata: Metadata = { title: "For Families", description: "A 4-week interactive experience that gives kids ages 7 to 12 the identity, beliefs and emotional tools they need to thrive." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
