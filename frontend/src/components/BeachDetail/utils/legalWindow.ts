const SOFIA_PARTS_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Sofia",
  month: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
});

const LEGAL_WINDOW_START_MINUTES = 9 * 60;
const LEGAL_WINDOW_END_MINUTES = 18 * 60 + 30;
const SEASON_START_MONTH = 6;
const SEASON_END_MONTH = 9;

/** True outside the 09:00-18:30 lifeguard window or outside the June-September season, both in Europe/Sofia local time. */
export function isOutsideLegalWindow(now: Date = new Date()): boolean {
  const parts = SOFIA_PARTS_FORMATTER.formatToParts(now);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  const minutesOfDay = hour * 60 + minute;

  const outsideSeason = month < SEASON_START_MONTH || month > SEASON_END_MONTH;
  const outsideHours = minutesOfDay < LEGAL_WINDOW_START_MINUTES || minutesOfDay >= LEGAL_WINDOW_END_MINUTES;

  return outsideSeason || outsideHours;
}
