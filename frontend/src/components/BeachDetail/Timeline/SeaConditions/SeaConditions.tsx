import { FaWind, FaWater } from "react-icons/fa6";
import { WIND_FEEL, SEA_FEEL } from "../conditionsCopy";
import type { SeaConditionsProps } from "./interfaces";
import { getSeaConditionsStyles } from "./styles/SeaConditions.styles";

// WIND_FEEL/SEA_FEEL live in ../conditionsCopy — shared with Verdict's synthesized
// sentence so the two never drift into describing the same wind differently.

export function SeaConditions({ prediction }: SeaConditionsProps) {
  const styles = getSeaConditionsStyles();

  return (
    <div style={styles.stack}>
      <div style={styles.panel} role="status">
        <FaWind style={styles.icon} aria-hidden="true" />
        <div style={styles.textCol}>
          <span style={styles.label}>Wind: {prediction.readableWindSpeed}</span>
          <span style={styles.caption}>{WIND_FEEL[prediction.readableWindSpeed]}</span>
        </div>
      </div>
      <div style={styles.panel} role="status">
        <FaWater style={styles.icon} aria-hidden="true" />
        <div style={styles.textCol}>
          <span style={styles.label}>Sea: {prediction.readableSeaState}</span>
          <span style={styles.caption}>{SEA_FEEL[prediction.readableSeaState]}</span>
        </div>
      </div>
    </div>
  );
}
