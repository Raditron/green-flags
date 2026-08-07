import type { Confidence, HourlyPrediction } from "../../interfaces";
import { getHourDetailStyles } from "./styles/HourDetail.styles";

interface HourDetailProps {
  prediction: HourlyPrediction;
}

const RADIUS = 36;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CENTER = SVG_SIZE / 2;

// The percent renders as the ring fill; this is just the "why" underneath it, so it
// no longer repeats the number the way the old single-sentence version did.
function confidenceCaption({ basis, sampleSize }: Confidence): string {
  if (basis === "certain") return "Conditions are clear of every threshold";
  if (basis === "prior" || sampleSize === 0) return "No matching reports yet";
  return `Based on ${sampleSize} past report${sampleSize === 1 ? "" : "s"}`;
}

export function HourDetail({ prediction }: HourDetailProps) {
  const styles = getHourDetailStyles();
  const { percent } = prediction.confidence;
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div style={styles.panel} role="status">
      <span style={styles.hour}>{prediction.hour}:00</span>

      <div
        style={styles.ringWrap}
        role="progressbar"
        aria-label="Confidence"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} aria-hidden="true">
          {/* Dedicated track opacity rather than relying on --border reading lighter than
              --text: in the dark theme both tokens resolve to the same "nepal" hex, which
              made the ring look like a solid circle with no visible cutoff. */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="var(--text)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            style={styles.ringTrack}
          />
          {/* Neutral blue rather than the flag palette — this measures how much data backs
              the prediction, not whether the water is safe, so it deliberately reads as a
              different signal than the red/yellow/green flag it sits next to (ADR-0004). */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="var(--text)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={styles.ringProgress}
          />
        </svg>
        <span style={styles.percent}>{percent}%</span>
      </div>

      <p style={styles.caption}>{confidenceCaption(prediction.confidence)}</p>
    </div>
  );
}
