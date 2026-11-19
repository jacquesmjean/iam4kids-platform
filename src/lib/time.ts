/**
 * Dates, entered and shown in the time zone of the person doing the work.
 *
 * The database stores every session in UTC (see 0002_events.sql). Mark
 * thinks in Eastern time. So the console asks for a date, a time and a
 * zone, converts to UTC on save, and converts back when it shows the value.
 * No library: Intl already knows every zone and every daylight saving rule.
 */

export const ZONES = [
  { id: "America/New_York", label: "Eastern" },
  { id: "America/Chicago", label: "Central" },
  { id: "America/Denver", label: "Mountain" },
  { id: "America/Los_Angeles", label: "Pacific" },
] as const;

export const DEFAULT_ZONE = "America/New_York";

/** Offset, in minutes, of `zone` from UTC at the instant `utc`. */
function offsetMinutes(utc: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utc);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (asUtc - utc.getTime()) / 60000;
}

/**
 * "2026-12-10" + "19:00" in America/New_York -> the UTC instant.
 * Two passes, so a time on the day the clocks change still lands correctly.
 */
export function zonedToUtc(date: string, time: string, zone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m || !t) return null;
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]);
  let guess = new Date(naive - offsetMinutes(new Date(naive), zone) * 60000);
  guess = new Date(naive - offsetMinutes(guess, zone) * 60000);
  return Number.isNaN(guess.getTime()) ? null : guess;
}

/** The UTC instant -> { date: "2026-12-10", time: "19:00" } in `zone`, for form defaults. */
export function utcToZoned(iso: string, zone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** "Thursday, December 10, 2026 at 7:00 PM EST" in the reader's language. */
export function formatWhen(iso: string, locale: "en" | "es" = "en", zone: string = DEFAULT_ZONE): string {
  return new Date(iso).toLocaleString(locale === "es" ? "es-US" : "en-US", {
    timeZone: zone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/** Short form for tables: "Nov 18, 2026, 4:29 PM". Eastern unless told otherwise. */
export function formatShort(iso: string, zone: string = DEFAULT_ZONE): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: zone,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}
