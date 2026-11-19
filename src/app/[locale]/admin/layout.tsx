import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ConsoleNav } from "@/components/ConsoleNav";
import { requireStaff } from "@/lib/auth";
import { signOut } from "../login/actions";

export const dynamic = "force-dynamic";

/**
 * The staff console frame. Everything under /admin is behind sign-in: this
 * layout sends anyone who is not on the staff list to the sign-in page, and
 * the database refuses them anyway if they get past it.
 */
export default async function ConsoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === "es" ? "es" : "en";
  const staff = await requireStaff(locale);

  const path = (await headers()).get("x-pathname") ?? "";
  if (staff.mustChangePassword && !path.endsWith("/admin/password")) {
    redirect(`/${locale}/admin/password`);
  }

  const head = { count: "exact" as const, head: true };
  const [n, f, s, d, c] = await Promise.all([
    staff.db.from("staff_notification").select("id", head).is("read_at", null),
    staff.db.from("client_feedback").select("id", head).is("read_at", null),
    staff.db.from("school_inquiry").select("id", head).eq("status", "new"),
    staff.db.from("decision_request").select("id", head).eq("status", "open"),
    staff.db.from("content_derivative").select("id", head).eq("status", "in_review"),
  ]);

  const firstName = staff.fullName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <div className="bg-[#0b1b3a] text-white">
        <div className="mx-auto max-w-6xl px-6 pt-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href={`/${locale}/admin`} className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">I AM 4 Kids</span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
                Staff console
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-4 text-sm text-white/70">
              <Link href={`/${locale}/schools`} className="hover:text-white">
                View Schools page
              </Link>
              <span className="hidden sm:inline">Signed in as {firstName}</span>
              <Link href={`/${locale}/admin/password`} className="hover:text-white">
                Password
              </Link>
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <button className="rounded-md border border-white/25 px-3 py-1 text-white hover:border-white/60">
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <div className="mt-4 pb-3">
            <ConsoleNav
              locale={locale}
              counts={{
                notifications: n.count ?? 0,
                feedback: f.count ?? 0,
                schools: s.count ?? 0,
                decisions: d.count ?? 0,
                content: c.count ?? 0,
              }}
            />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-[#12224a]/50">
        Every change here is saved against your name.{" "}
        <a href="https://techfides.com" target="_blank" rel="noopener" className="font-semibold text-[#0EA5E9]">
          Powered by TechFides
        </a>
      </footer>
    </div>
  );
}
