import type { Metadata } from "next";
import En from "@/site/pages/contact.en";
import Es from "@/site/pages/contact.es";

export const metadata: Metadata = { title: "Get Started", description: "Tell us about your family or school. A real person follows up within one business day." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
