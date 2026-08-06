import type { Confidence, HourlyPrediction } from "../../interfaces";
import styles from "./styles/HourDetail.module.css";

interface HourDetailProps {
  prediction: HourlyPrediction;
}

function confidenceLine({ percent, basis, sampleSize }: Confidence): string {
  const detail =
    basis === "certain"
      ? "conditions are clear of every threshold"
      : basis === "prior" || sampleSize === 0
        ? "no matching reports yet"
        : `based on ${sampleSize} past report${sampleSize === 1 ? "" : "s"}`;
  return `${percent}% confident — ${detail}`;
}

export function HourDetail({ prediction }: HourDetailProps) {
  return (
    <div className={styles.panel} role="status">
      <span className={styles.hour}>{prediction.hour}:00</span>
      <p className={styles.gloss}>{confidenceLine(prediction.confidence)}</p>
    </div>
  );
}
