import type { Confidence, HourlyPrediction } from "../../interfaces";
import { getHourDetailStyles } from "./styles/HourDetail.styles";

interface HourDetailProps {
  prediction: HourlyPrediction;
}

// The percent renders as the meter fill; this is just the "why" underneath it, so it
// no longer repeats the number the way the old single-sentence version did.
function confidenceCaption({ basis, sampleSize }: Confidence): string {
  if (basis === "certain") return "Conditions are clear of every threshold";
  if (basis === "prior" || sampleSize === 0) return "No matching reports yet";
  return `Based on ${sampleSize} past report${sampleSize === 1 ? "" : "s"}`;
}

export function HourDetail({ prediction }: HourDetailProps) {
  const styles = getHourDetailStyles();
  const { percent } = prediction.confidence;

  return (
    <div style={styles.panel} role="status">
      <span style={styles.hour}>{prediction.hour}:00</span>

      <div style={styles.meterRow}>
        <div
          style={styles.meterTrack}
          role="progressbar"
          aria-label="Confidence"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ ...styles.meterFill, width: `${percent}%` }} />
        </div>
        <span style={styles.percent}>{percent}%</span>
      </div>

      <p style={styles.caption}>{confidenceCaption(prediction.confidence)}</p>
    </div>
  );
}
