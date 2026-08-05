const SOFIA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Sofia",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
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
