import { SiteShell } from "@/site/SiteShell";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SiteShell locale={locale === "es" ? "es" : "en"}>{children}</SiteShell>;
}
