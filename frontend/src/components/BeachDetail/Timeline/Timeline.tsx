import { useState } from "react";
import type { HourlyPrediction } from "../interfaces";
import { HourDetail } from "./HourDetail/HourDetail";
import styles from "./styles/Timeline.module.css";

interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
}

export function Timeline({ hourlyPredictions, desaturated = false }: TimelineProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const selectedPrediction = hourlyPredictions.find((prediction) => prediction.hour === selectedHour);

  return (
    <>
      <ol className={`${styles.strip} ${desaturated ? styles.desaturated : ""}`}>
        {hourlyPredictions.map((prediction) => (
          <li key={prediction.hour} className={styles.segmentItem}>
            <button
              type="button"
              className={styles.segment}
              data-flag={prediction.flagColor}
              data-selected={selectedHour === prediction.hour}
              aria-pressed={selectedHour === prediction.hour}
              onClick={() =>
                setSelectedHour((current) => (current === prediction.hour ? null : prediction.hour))
              }
            >
              <span className={styles.hour}>{prediction.hour}:00</span>
            </button>
          </li>
        ))}
      </ol>

      {selectedPrediction && <HourDetail prediction={selectedPrediction} />}
    </>
  );
}
