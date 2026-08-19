import type { AverageAttributes, SeaStateReadable, WindSpeedReadable } from "../interfaces";

// SEA_FEEL/WIND_FEEL are ported from frontend/src/components/BeachDetail/Timeline/
// conditionsCopy.ts, verbatim. Mobile's BeachDetail is still #92's placeholder (built out by
// #97-99), so there's no Timeline/conditionsCopy.ts to import from yet — these live here,
// colocated with the one thing that needs them today, until BeachDetail exists and this can
// import from there instead (matching frontend's layout) rather than duplicating.
const WIND_FEEL: Record<WindSpeedReadable, string> = {
  calm: "Barely a breath of wind",
  "light air": "Just enough to ripple the water",
  "light breeze": "A light, pleasant breeze",
  "gentle breeze": "Comfortable breeze on the skin",
  "moderate breeze": "Noticeable wind, hard to ignore",
  "fresh breeze": "Strong enough to kick up spray",
  "strong breeze": "Strong wind — swimming gets tiring",
  "near gale": "Very strong wind — stay cautious",
  gale: "Gale-force wind — hazardous",
  "strong gale": "Severe wind — dangerous conditions",
  storm: "Storm-force wind — stay out of the water",
};

const SEA_FEEL: Record<SeaStateReadable, string> = {
  calm: "Flat, glassy water",
  rippled: "Tiny ripples, barely a wave",
  smooth: "Gentle, rolling water",
  slight: "Small waves, easy swimming",
  moderate: "Choppier water — stay alert",
  rough: "Rough waves — swim with caution",
  "very rough": "Very rough seas — risky to swim",
  high: "High, dangerous waves",
};

// A card is backed by a thin sample when it has fewer than two contributing beaches or
// fewer than five hourly readings — either way, not enough to read with full confidence.
const LOW_BEACH_COUNT_THRESHOLD = 2;
const LOW_SAMPLE_SIZE_THRESHOLD = 5;

/** Same "sea feel · wind feel" formula frontend's conditionsSentence uses, built from an
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
