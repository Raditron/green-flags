import type { HourlyPrediction } from "../interfaces";
import styles from "./styles/Timeline.module.css";

interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
}

export function Timeline({ hourlyPredictions, desaturated = false }: TimelineProps) {
  return (
    <ol className={`${styles.strip} ${desaturated ? styles.desaturated : ""}`}>
      {hourlyPredictions.map((prediction) => (
        <li key={prediction.hour} className={styles.segment} data-flag={prediction.flagColor}>
          <span className={styles.hour}>{prediction.hour}:00</span>
        </li>
      ))}
    </ol>
  );
}
