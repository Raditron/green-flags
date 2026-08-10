import { SEA_FEEL, WIND_FEEL } from "../../BeachDetail/Timeline/conditionsCopy";
import type { AverageAttributes } from "../interfaces";

// A card is backed by a thin sample when it has fewer than two contributing beaches or
// fewer than five hourly readings — either way, not enough to read with full confidence.
const LOW_BEACH_COUNT_THRESHOLD = 2;
const LOW_SAMPLE_SIZE_THRESHOLD = 5;

/** Same "sea feel · wind feel" formula Verdict.tsx's conditionsSentence uses, built from an
 * averaged card's readable labels instead of a single hourly prediction's. */
export function averageConditionsSentence(attributes: AverageAttributes): string {
  return `${SEA_FEEL[attributes.readableSeaState]} · ${WIND_FEEL[attributes.readableWindSpeed]}`;
}

/** "Based on N readings across M beaches" — the trust-signal footer every card (hero and
 * area) always shows, regardless of sample size. */
export function readingsFooter(attributes: AverageAttributes): string {
  const readings = `${attributes.sampleSize} reading${attributes.sampleSize === 1 ? "" : "s"}`;
  const beaches = `${attributes.beachCount} beach${attributes.beachCount === 1 ? "" : "es"}`;
  return `Based on ${readings} across ${beaches}`;
}

/** True when a card's sample is thin enough to caveat on top of the footer above. */
export function isLowSample(attributes: AverageAttributes): boolean {
  return attributes.beachCount < LOW_BEACH_COUNT_THRESHOLD || attributes.sampleSize < LOW_SAMPLE_SIZE_THRESHOLD;
}
