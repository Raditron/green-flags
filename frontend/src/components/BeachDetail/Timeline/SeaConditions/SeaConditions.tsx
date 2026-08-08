import { FaWind, FaWater } from "react-icons/fa6";
import type { HourlyPrediction, SeaStateReadable, WindSpeedReadable } from "../../interfaces";
import { getSeaConditionsStyles } from "./styles/SeaConditions.styles";

interface SeaConditionsProps {
  prediction: HourlyPrediction;
}

// Beaufort force names ("moderate breeze") are precise but mean nothing to a swimmer
// deciding whether to go in — this is the plain-language gloss shown under each one.
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

// Same idea for the Douglas sea-state scale ("slight", "very rough") — swimmers think in
// terms of what the waves will do to them, not the WMO code name.
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

export function SeaConditions({ prediction }: SeaConditionsProps) {
  const styles = getSeaConditionsStyles();

  return (
    <div style={styles.panel} role="status">
      <div style={styles.row}>
        <FaWind style={styles.icon} aria-hidden="true" />
        <div style={styles.textCol}>
          <span style={styles.label}>Wind: {prediction.readableWindSpeed}</span>
          <span style={styles.caption}>{WIND_FEEL[prediction.readableWindSpeed]}</span>
        </div>
      </div>
      <div style={styles.row}>
        <FaWater style={styles.icon} aria-hidden="true" />
        <div style={styles.textCol}>
          <span style={styles.label}>Sea: {prediction.readableSeaState}</span>
          <span style={styles.caption}>{SEA_FEEL[prediction.readableSeaState]}</span>
        </div>
      </div>
    </div>
  );
}
