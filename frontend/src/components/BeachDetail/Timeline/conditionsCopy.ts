import type { HourlyPrediction, RipCurrentRisk, SeaStateReadable, WindSpeedReadable } from "../interfaces";

// Beaufort force names ("moderate breeze") are precise but mean nothing to a swimmer
// deciding whether to go in — this is the plain-language gloss shown for each one.
// Shared between Verdict's synthesized sentence and SeaConditions' itemized rows,
// so the two never drift into describing the same wind differently.
export const WIND_FEEL: Record<WindSpeedReadable, string> = {
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

// Same idea for the Douglas sea-state scale ("slight", "very rough") — swimmers think in
// terms of what the waves will do to them, not the WMO code name.
export const SEA_FEEL: Record<SeaStateReadable, string> = {
  calm: "Flat, glassy water",
  rippled: "Tiny ripples, barely a wave",
  smooth: "Gentle, rolling water",
  slight: "Small waves, easy swimming",
  moderate: "Choppier water — stay alert",
  rough: "Rough waves — swim with caution",
  "very rough": "Very rough seas — risky to swim",
  high: "High, dangerous waves",
};

// Only surfaced when there's actually something to watch for — a low rip-current
// reading has nothing worth adding to the verdict, so it's deliberately absent here
// rather than mapped to an empty string.
export const RIP_CURRENT_CAUTION: Partial<Record<RipCurrentRisk, string>> = {
  moderate: "Watch for rip currents",
  high: "Strong rip currents — stay close to shore",
};

// One synthesized sentence for the Verdict panel. SeaConditions renders the same two
// facts broken out into labeled wind/sea rows underneath — this is the headline,
// that's the itemized detail, not a second unrelated read of the data.
export function conditionsSentence(prediction: HourlyPrediction): string {
  return `${SEA_FEEL[prediction.readableSeaState]} · ${WIND_FEEL[prediction.readableWindSpeed]}`;
}
