import { Resend } from "resend";

/**
 * Email the team when something arrives that a person should see today.
 *
 * This is the second channel, not the first. The first is a row in
 * staff_notification, written by a database trigger on every feedback and
 * school inquiry, which the console shows as an unread count. That one
 * cannot be lost to a missing key or a spam filter.
 *
 * Email goes out only when all three are set on the deployment:
 *   RESEND_API_KEY     the I AM 4 Kids Resend key
 *   ALERT_EMAIL_FROM   a sender on a domain verified in that Resend account
 *   ALERT_EMAIL_TO     one or more addresses, comma separated
 * Missing any of them, it does nothing and says so in the server log.
 * It never throws: an alert failing must not fail the submission it is about.
 */
export async function alertStaff(subject: string, lines: string[], consolePath: string, origin?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM;
  const to = (process.env.ALERT_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!key || !from || to.length === 0) {
    console.info(`[alert] email not configured; "${subject}" is in the console notifications only.`);
    return { sent: false as const, reason: "not-configured" };
  }

  const link = origin ? `${origin}/en${consolePath}` : null;
  const text = [...lines, "", link ? `Open it: ${link}` : `Open the staff console: ${consolePath}`].join("\n");

  try {
    const { error } = await new Resend(key).emails.send({ from, to, subject, text });
    if (error) {
      console.error("[alert] Resend refused the alert:", error.message);
      return { sent: false as const, reason: error.message };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[alert] could not reach Resend:", err);
    return { sent: false as const, reason: "network" };
  }
}
