import type { Metadata } from "next";
import En from "@/site/pages/movement.en";
import Es from "@/site/pages/movement.es";

export const metadata: Metadata = { title: "The Movement", description: "Helping kids discover the power of who they are." };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
