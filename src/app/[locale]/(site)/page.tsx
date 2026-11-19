import type { Metadata } from "next";
import En from "@/site/pages/home.en";
import Es from "@/site/pages/home.es";

export const metadata: Metadata = {
  title: "I AM 4 Kids: Helping Kids Discover the Power of Who They Are",
  description:
    "We help children ages 7 to 12 build confidence, identity, and life skills through live family coaching, school programs, and empowering educational entertainment.",
};

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return locale === "es" ? <Es /> : <En />;
}
