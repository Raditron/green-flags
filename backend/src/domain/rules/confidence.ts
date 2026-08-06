import { HourlyConditions, RED_BEAUFORT_FORCE, RED_DOUGLAS_SEA_STATE, YELLOW_BEAUFORT_FORCE, YELLOW_DOUGLAS_SEA_STATE, effectiveWaveHeightM } from "./evaluateHourlyFlag";
import { BEAUFORT_UPPER_BOUNDS_MPS } from "./beaufortScale";
import { DOUGLAS_UPPER_BOUNDS_M } from "./douglasSeaState";

/**
 * Pseudo-observation weight of the historical per-bucket baseline in the live-feedback Bayesian
 * update (posterior = (baseline * kappa + todaysAgree) / (kappa + todaysTotal)). Ships as the
 * midpoint of the "8-10 corroborating reports" placeholder from
 * .scratch/green-flags-mvp/issues/04-feedback-abuse-resistance.md — explicitly flagged there for
 * retuning post-launch against real reports-per-beach-per-day, not total platform user count.
 */
export const CONFIDENCE_KAPPA = 9;

/** Wind/wave distance from the nearest color-flipping boundary beyond which conditions count as "well clear". */
const WELL_CLEAR_WIND_MARGIN_MPS = 2;
const WELL_CLEAR_WAVE_MARGIN_M = 0.4;

/** Confidence right on a boundary: a coin flip between the two adjacent flag colors. */
const DISTANCE_PRIOR_FLOOR = 0.5;
/** Cap on a prior derived from distance alone, reserving the top of the range for figures backed by real feedback. */
const DISTANCE_PRIOR_CEILING = 0.9;
/** Confidence once conditions are well clear of every threshold, regardless of feedback volume. */
export const FULL_CERTAINTY_CONFIDENCE = 0.98;

export interface DistancePrior {
  /** 0-1 confidence derived purely from how close conditions sit to a threshold that would flip the flag color. */
  prior: number;
  /** True once conditions are far enough from every threshold that the color call isn't in doubt. */
  wellClear: boolean;
}

/** The only fields the distance prior actually depends on — narrower than HourlyConditions so callers (e.g. re-scoring a stored prediction's forecast) don't need to fabricate an onshore wind direction. */
export type DistancePriorConditions = Pick<HourlyConditions, "windSpeedMps" | "waveHeightM" | "swellHeightM" | "stormWarningActive">;

function nearestBoundaryDistance(value: number, yellowBoundary: number, redBoundary: number): number {
  return Math.min(Math.abs(value - yellowBoundary), Math.abs(value - redBoundary));
}

function boundaryCloseness(distance: number, margin: number): number {
  return Math.min(distance / margin, 1);
}

/**
 * Confidence prior derived purely from distance to the nearest flag-flipping threshold — no
 * feedback data required, deterministic. Reuses the exact mps/m crossing points the rule engine's
 * Beaufort/Douglas classification already uses, rather than inventing separate bin boundaries.
 */
export function computeDistancePrior(conditions: DistancePriorConditions): DistancePrior {
  if (conditions.stormWarningActive) {
    return { prior: FULL_CERTAINTY_CONFIDENCE, wellClear: true };
  }

  const yellowWindBoundaryMps = BEAUFORT_UPPER_BOUNDS_MPS[YELLOW_BEAUFORT_FORCE - 1];
  const redWindBoundaryMps = BEAUFORT_UPPER_BOUNDS_MPS[RED_BEAUFORT_FORCE - 1];
  const yellowWaveBoundaryM = DOUGLAS_UPPER_BOUNDS_M[YELLOW_DOUGLAS_SEA_STATE - 1];
  const redWaveBoundaryM = DOUGLAS_UPPER_BOUNDS_M[RED_DOUGLAS_SEA_STATE - 1];

  const windDistance = nearestBoundaryDistance(conditions.windSpeedMps, yellowWindBoundaryMps, redWindBoundaryMps);
  const waveDistance = nearestBoundaryDistance(effectiveWaveHeightM(conditions), yellowWaveBoundaryM, redWaveBoundaryM);

  const closeness = Math.min(
    boundaryCloseness(windDistance, WELL_CLEAR_WIND_MARGIN_MPS),
    boundaryCloseness(waveDistance, WELL_CLEAR_WAVE_MARGIN_M)
  );
  const wellClear = closeness >= 1;

  return {
    prior: wellClear ? FULL_CERTAINTY_CONFIDENCE : DISTANCE_PRIOR_FLOOR + (DISTANCE_PRIOR_CEILING - DISTANCE_PRIOR_FLOOR) * closeness,
    wellClear,
  };
}

export type ConfidenceBasis = "certain" | "prior" | "blended";

export interface ConfidenceResult {
  /** 0-100, rounded. */
  percent: number;
  basis: ConfidenceBasis;
  /** Total corroborating reports (historical + today's) behind this figure; 0 for prior-only/certain. */
  sampleSize: number;
}

export interface HistoricalBucketStats {
  hits: number;
  total: number;
}

export interface TodaysReports {
  agree: number;
  total: number;
}

export interface CalibrateConfidenceInput {
  distancePrior: number;
  wellClear: boolean;
  historicalStats?: HistoricalBucketStats;
  todaysReports?: TodaysReports;
  kappa?: number;
}

function toPercent(fraction: number): number {
  return Math.round(fraction * 100);
}

/**
 * Turns a distance-to-threshold prior plus whatever feedback exists into a single confidence
 * figure. Per .scratch/green-flags-mvp/issues/01-prediction-model-architecture.md and
 * 04-feedback-abuse-resistance.md: well-clear conditions are stated with full/high certainty
 * regardless of feedback volume; a bucket with no feedback history falls back to the prior alone;
 * otherwise today's live reports nudge the historical (or prior) baseline via the kappa-weighted
 * Bayesian update.
 */
export function calibrateConfidence(input: CalibrateConfidenceInput): ConfidenceResult {
  const historicalTotal = input.historicalStats?.total ?? 0;
  const todaysTotal = input.todaysReports?.total ?? 0;

  if (input.wellClear) {
    return { percent: toPercent(input.distancePrior), basis: "certain", sampleSize: historicalTotal + todaysTotal };
  }

  if (historicalTotal === 0 && todaysTotal === 0) {
    return { percent: toPercent(input.distancePrior), basis: "prior", sampleSize: 0 };
  }

  const kappa = input.kappa ?? CONFIDENCE_KAPPA;
  const baseline = historicalTotal > 0 ? input.historicalStats!.hits / historicalTotal : input.distancePrior;
  const todaysAgree = input.todaysReports?.agree ?? 0;

  const posterior = (baseline * kappa + todaysAgree) / (kappa + todaysTotal);

  return { percent: toPercent(posterior), basis: "blended", sampleSize: historicalTotal + todaysTotal };
}
