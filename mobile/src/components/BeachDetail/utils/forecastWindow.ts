// RN port of frontend/src/components/BeachDetail/utils/forecastWindow.ts, verbatim.
const SOFIA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Sofia",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const SOFIA_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Sofia",
  weekday: "short",
});

// Mirrors backend/src/domain/shared/today.ts's todayInSofia — kept as a separate copy since
// mobile and backend don't share a module boundary, but the formatter must stay identical.
export function todayInSofia(now: Date = new Date()): string {
  return SOFIA_DATE_FORMATTER.format(now);
}

// UTC-midnight arithmetic, same trick as the backend's previousCalendarDate: a YYYY-MM-DD date
// string has no timezone of its own, so adding calendar days is safe to do at UTC midnight
// regardless of Sofia's actual offset.
export function addDays(date: string, days: number): string {
  const shifted = new Date(Date.parse(`${date}T00:00:00Z`) + days * 24 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

/** The 7 calendar dates (YYYY-MM-DD) the Forecast Strip covers: today, then the next 6 days, in Europe/Sofia local time. */
export function forecastWindowDates(now: Date = new Date()): string[] {
  const today = todayInSofia(now);
  return Array.from({ length: 7 }, (_, index) => addDays(today, index));
}

/** Short chip label for a forecast-window date: "Today" for the first date, otherwise a Sofia-local short weekday name (e.g. "Mon"). */
export function forecastChipLabel(date: string, today: string): string {
  if (date === today) return "Today";
  return SOFIA_WEEKDAY_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}
