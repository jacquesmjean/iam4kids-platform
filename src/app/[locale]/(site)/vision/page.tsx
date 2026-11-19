import type { Metadata } from "next";
import En from "@/site/pages/vision.en";
import Es from "@/site/pages/vision.es";

export const metadata: Metadata = { title: "The Bigger Vision", description: "An identity-based media platform for kids: animated, authentic, empowering." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
