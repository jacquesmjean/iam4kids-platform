import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { isLocale, type Locale } from "@/i18n/copy";
import { getStaff } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";

  if (await getStaff()) redirect(`/${locale}/admin`);

  return (
    <>
      <Nav locale={locale} current="admin" />
      <main className="mx-auto max-w-md px-6 py-16 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          I AM 4 Kids · Staff
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#0b1b3a]">Sign in to the staff console</h1>
        <p className="mt-3 leading-relaxed text-[#12224a]/75">
          Change your pages, set event dates, read feedback and school inquiries, and answer the
          decisions waiting on you. No email to TechFides needed.
        </p>
        <LoginForm locale={locale} />
        <p className="mt-6 text-sm text-[#12224a]/60">
          Forgot your password? Ask Jacques to reset it. Only people on the I AM 4 Kids staff list
          can sign in here.
        </p>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
