const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateUTC(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/**
 * Whole days between when a Prediction was issued and the date it targets — 0 for a same-day
 * ("near-tier") Prediction, up to 6 for one issued at the start of the rolling forecast window.
 * Both inputs are YYYY-MM-DD Europe/Sofia calendar dates; diffed as UTC midnights so the
 * subtraction is immune to DST, which never changes the calendar-day count between two dates.
 */
export function deriveLead(issuedDate: string, targetDate: string): number {
  return Math.round((parseDateUTC(targetDate) - parseDateUTC(issuedDate)) / MS_PER_DAY);
}

export type LeadTier = "near" | "mid" | "far";

/** Upper (inclusive) Lead bound of the "near" tier. */
const NEAR_MAX_LEAD = 1;
/** Upper (inclusive) Lead bound of the "mid" tier; anything beyond is "far". */
const MID_MAX_LEAD = 4;

/**
 * Coarse bucket of Lead used wherever confidence calibration or reconciliation needs to group
 * Predictions by how far out they were issued (near 0-1 / mid 2-4 / far 5-6 days). These
 * boundaries are a launch placeholder, flagged for retuning once real reconciliation data exists —
 * see docs/adr/0007-prediction-keyed-by-target-and-issued-date.md.
 */
export function deriveLeadTier(lead: number): LeadTier {
  if (lead <= NEAR_MAX_LEAD) return "near";
  if (lead <= MID_MAX_LEAD) return "mid";
  return "far";
}
