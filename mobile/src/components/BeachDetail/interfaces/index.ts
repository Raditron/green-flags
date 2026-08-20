import type { Beach, FlagColor } from "../../../shared/types/Beach";

export type { FlagColor };

/**
 * Route params Beach Detail is pushed with — the `beachId` path segment on web's
 * `/beaches/:beachId`, plus the same beach fields frontend's `<Link state={...}>` passes through
 * router navigation state (see frontend's BeachDetail.tsx and BeachListCard.tsx) so opening a beach
 * from the list doesn't have to re-fetch the whole beach list just to show its name/notes/guarded
 * status again — see useBeach. All optional: a direct/deep-linked navigation to BeachDetail (no
 * mobile equivalent yet, but kept consistent with frontend's own fallback path) still works, just
 * falling back to fetchBeach.
 */
export interface BeachDetailRouteParams {
  beachId: string;
  name?: string;
  quirkNotes?: string;
  isUnguarded?: boolean;
}

/**
 * Builds the params above from a full `Beach` — the one shape BeachList.tsx's and
 * SavedBeaches.tsx's handlePressBeach both need when pushing BeachDetail, so it lives here next to
 * the type it constructs rather than being redefined at each call site.
 */
export function toBeachDetailParams(beach: Beach): BeachDetailRouteParams {
  return {
    beachId: beach.id,
    name: beach.name,
    quirkNotes: beach.quirkNotes,
    isUnguarded: beach.isUnguarded,
  };
}

export type RipCurrentRisk = "low" | "moderate" | "high";
export type ConfidenceBasis = "certain" | "prior" | "blended";

// Mirrors backend/src/domain/rules/beaufortScale.ts's WindSpeedReadable. Capped at "storm"
// since hurricane-grade Beaufort forces never occur in a Black Sea hourly forecast.
export type WindSpeedReadable =
  | "calm"
  | "light air"
  | "light breeze"
  | "gentle breeze"
  | "moderate breeze"
  | "fresh breeze"
  | "strong breeze"
  | "near gale"
  | "gale"
  | "strong gale"
  | "storm";

// Mirrors backend/src/domain/rules/douglasSeaState.ts's SeaStateReadable. Capped at "high"
// for the same reason as WindSpeedReadable above.
export type SeaStateReadable =
  | "calm"
  | "rippled"
  | "smooth"
  | "slight"
  | "moderate"
  | "rough"
  | "very rough"
  | "high";

export interface Confidence {
  percent: number;
  basis: ConfidenceBasis;
  sampleSize: number;
}

export interface HourlyPrediction {
  hour: number;
  flagColor: FlagColor;
  ripCurrentRisk: RipCurrentRisk;
  confidence: Confidence;
  readableWindSpeed: WindSpeedReadable;
  readableSeaState: SeaStateReadable;
}

export interface BeachDailyPredictions {
  beachId: string;
  date: string;
  /** Calendar date (YYYY-MM-DD) the batch run that produced this Prediction actually ran on. Mirrors backend/src/domain/ports/prediction/predictionRepository.ts's BeachDailyPredictions. */
  issuedDate: string;
  hourlyPredictions: HourlyPrediction[];
}
