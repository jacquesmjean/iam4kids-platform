import { redirect } from "next/navigation";

// The content workbench now lives in the staff console (Content tab).
export default async function ContentMoved({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale === "es" ? "es" : "en"}/admin/content`);
}
