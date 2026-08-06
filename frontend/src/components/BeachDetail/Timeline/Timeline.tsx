import { useState } from "react";
import type { HourlyPrediction } from "../interfaces";
import { HourDetail } from "./HourDetail/HourDetail";
import styles from "./styles/Timeline.module.css";

interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
}

export function Timeline({ hourlyPredictions, desaturated = false, currentHour = null }: TimelineProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(currentHour);
  const selectedPrediction = hourlyPredictions.find((prediction) => prediction.hour === selectedHour);

  return (
    <>
      <ol className={`${styles.strip} ${desaturated ? styles.desaturated : ""}`}>
        {hourlyPredictions.map((prediction) => {
          const isCurrent = prediction.hour === currentHour;
          return (
            <li key={prediction.hour} className={styles.segmentItem}>
              <button
                type="button"
                className={styles.segment}
                data-flag={prediction.flagColor}
                data-selected={selectedHour === prediction.hour}
                data-current={isCurrent}
                aria-pressed={selectedHour === prediction.hour}
                aria-label={`${prediction.hour}:00${isCurrent ? " (current hour)" : ""}`}
                onClick={() =>
                  setSelectedHour((current) => (current === prediction.hour ? null : prediction.hour))
                }
              >
                {isCurrent && <span className={styles.nowLabel}>Now</span>}
                <span className={styles.hour}>{prediction.hour}:00</span>
              </button>
            </li>
          );
        })}
      </ol>

      {selectedPrediction && <HourDetail prediction={selectedPrediction} />}
    </>
  );
}
