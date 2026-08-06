/**
 * The legally-guaranteed flag window on staffed Bulgarian beaches is 09:00-18:30 (see
 * .scratch/green-flags-mvp/issues/08-feedback-window-and-off-season.md). Forecast data is hourly
 * (on the hour), so the window is evaluated at its ten whole hours: 09:00 through 18:00 inclusive
 * — the last of which still falls inside the window's 18:30 close.
 */
export const LEGAL_WINDOW_START_HOUR = 9;
export const LEGAL_WINDOW_END_HOUR = 18;

export function isWithinLegalWindow(hour: number): boolean {
  return hour >= LEGAL_WINDOW_START_HOUR && hour <= LEGAL_WINDOW_END_HOUR;
}

/**
 * Lifeguard coverage runs June 1 - September 30 (see
 * .scratch/green-flags-mvp/issues/08-feedback-window-and-off-season.md). Outside this season
 * there's no lifeguard-raised flag for anyone to observe, so feedback collection is closed
 * entirely regardless of hour.
 */
export const LEGAL_SEASON_START_MONTH = 6;
export const LEGAL_SEASON_END_MONTH = 9;

/** `date` is a YYYY-MM-DD calendar date, evaluated as a plain calendar month (no timezone conversion needed since callers already resolve it in Europe/Sofia local time). */
export function isWithinLegalSeason(date: string): boolean {
  const month = Number(date.slice(5, 7));
  return month >= LEGAL_SEASON_START_MONTH && month <= LEGAL_SEASON_END_MONTH;
}
