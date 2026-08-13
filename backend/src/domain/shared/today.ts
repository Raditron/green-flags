import { LEGAL_WINDOW_END_HOUR, LEGAL_WINDOW_START_HOUR } from "../rules/legalWindow";

const SOFIA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Sofia",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const SOFIA_HOUR_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Sofia",
  hour: "2-digit",
  hourCycle: "h23",
});

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date (YYYY-MM-DD) in Europe/Sofia local time — the timezone every seeded beach shares. */
export function todayInSofia(now: Date = new Date()): string {
  return SOFIA_DATE_FORMATTER.format(now);
}

/** Resolves an optional, possibly-malformed date query param, defaulting to today (Europe/Sofia). Returns null if the given value isn't a valid YYYY-MM-DD date. */
export function resolvePredictionDate(rawDate: string | undefined, now: Date = new Date()): string | null {
  if (rawDate === undefined) return todayInSofia(now);
  return DATE_PATTERN.test(rawDate) ? rawDate : null;
}

/** The current hour (0-23) in Europe/Sofia local time, unclamped. */
export function currentSofiaHour(now: Date = new Date()): number {
  return Number(SOFIA_HOUR_FORMATTER.format(now));
}

/** The current Sofia-local hour, clamped into the legal flag window — the hour a beach list row should show. */
export function currentOrNearestLegalHour(now: Date = new Date()): number {
  const hour = currentSofiaHour(now);
  if (hour < LEGAL_WINDOW_START_HOUR) return LEGAL_WINDOW_START_HOUR;
  if (hour > LEGAL_WINDOW_END_HOUR) return LEGAL_WINDOW_END_HOUR;
  return hour;
}

/** The calendar date (YYYY-MM-DD) immediately before the given one. Pure date-string arithmetic (UTC midnight diffing), not tied to Europe/Sofia "now" — callers pass in an already-resolved Sofia date. */
export function previousCalendarDate(date: string): string {
  const previous = new Date(Date.parse(`${date}T00:00:00Z`) - 24 * 60 * 60 * 1000);
  return previous.toISOString().slice(0, 10);
}
