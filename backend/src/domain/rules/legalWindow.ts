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
