import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/copy";
import { getStaff } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: import("next").Metadata = { title: "Team sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";

  if (await getStaff()) redirect(`/${locale}/admin`);

  return (
    <>
      <div className="mx-auto max-w-md px-6 py-12 md:py-16"><div className="glass-strong rounded-3xl p-7 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          I AM 4 Kids Team
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Sign in to the staff console</h1>
        <p className="mt-3 leading-relaxed text-ink/75">
          Change your pages, set event dates, read feedback and school inquiries, and answer the
          decisions waiting on you. No email to TechFides needed.
        </p>
        <LoginForm locale={locale} />
        <p className="mt-6 text-sm text-ink/60">
          Forgot your password? Ask Jacques to reset it. Only people on the I AM 4 Kids staff list
          can sign in here.
        </p>
      </div></div>
    </>
  );
}
