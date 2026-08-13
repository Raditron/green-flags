import type { HourlyPrediction } from "../interfaces";

// Same lifeguard-hours bound legalWindow.ts already encodes for "today" (09:00-18:30 — hours 9
// through 18 inclusive once bucketed to whole hours).
const WORST_CASE_WINDOW_START_HOUR = 9;
const WORST_CASE_WINDOW_END_HOUR = 18;

const SEVERITY_ORDER: Record<HourlyPrediction["flagColor"], number> = {
  green: 0,
  yellow: 1,
  red: 2,
};

/**
 * Reduces a day's HourlyPrediction[] to the single hour that represents that day in Day Outlook:
 * the most severe flag color (red > yellow > green) among hours 9-18 inclusive, tie-breaking on
 * the earliest qualifying hour. Confidence, forecast/conditions fields, and the hour number are
 * returned unchanged from that hour's own prediction. See
 * docs/adr/0010-worst-case-hour-of-day-in-frontend.md for why a single worst-case hour (rather than
 * an average, a fixed hour, or a backend contract change) represents a future day.
 */
export function worstCaseHour(hourlyPredictions: HourlyPrediction[]): HourlyPrediction | null {
  let worst: HourlyPrediction | null = null;

  for (const prediction of hourlyPredictions) {
    if (prediction.hour < WORST_CASE_WINDOW_START_HOUR || prediction.hour > WORST_CASE_WINDOW_END_HOUR) continue;

    if (!worst) {
      worst = prediction;
      continue;
    }

    const severity = SEVERITY_ORDER[prediction.flagColor];
    const worstSeverity = SEVERITY_ORDER[worst.flagColor];
    if (severity > worstSeverity || (severity === worstSeverity && prediction.hour < worst.hour)) {
      worst = prediction;
    }
  }

  return worst;
}
