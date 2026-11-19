import { requireStaff } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { changePassword } from "../actions";
import { Flash, Locale, ScreenHeader, field, first, label, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

export default async function ChangePassword({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const sp = await searchParams;
  const staff = await requireStaff(locale);

  return (
    <div className="max-w-lg">
      <ScreenHeader
        title={staff.mustChangePassword ? "Choose your own password" : "Change your password"}
        lede={
          staff.mustChangePassword
            ? "You signed in with a temporary password. Pick one only you know before going further. At least 10 characters; a short sentence is easy to remember and hard to guess."
            : "At least 10 characters. A short sentence is easy to remember and hard to guess."
        }
      />
      <Flash ok={first(sp.ok)} error={first(sp.error)} />
      <form action={changePassword} className="mt-8 space-y-4 rounded-2xl border border-[#0b1b3a]/10 bg-white p-6 shadow-sm">
        <Locale locale={locale} />
        <label className="block">
          <span className={label}>New password</span>
          <input type="password" name="password" minLength={10} autoComplete="new-password" required className={`mt-1 ${field}`} />
        </label>
        <label className="block">
          <span className={label}>Type it again</span>
          <input type="password" name="confirm" minLength={10} autoComplete="new-password" required className={`mt-1 ${field}`} />
        </label>
        <SubmitButton pending="Saving…">Save password</SubmitButton>
      </form>
    </div>
  );
}
