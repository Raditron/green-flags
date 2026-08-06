import { useState } from "react";
import type { HourlyPrediction } from "../interfaces";
import { HourDetail } from "./HourDetail/HourDetail";
import { getTimelineStyles, getSegmentStyle } from "./styles/Timeline.styles";

interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
}

export function Timeline({ hourlyPredictions, desaturated = false, currentHour = null }: TimelineProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(currentHour);
  const selectedPrediction = hourlyPredictions.find((prediction) => prediction.hour === selectedHour);
  const styles = getTimelineStyles({ desaturated });

  return (
    <>
      <ol style={styles.strip}>
        {hourlyPredictions.map((prediction) => {
          const isCurrent = prediction.hour === currentHour;
          const isSelected = selectedHour === prediction.hour;
          return (
            <li key={prediction.hour} style={styles.segmentItem}>
              <button
                type="button"
                style={getSegmentStyle({ flagColor: prediction.flagColor, selected: isSelected, current: isCurrent })}
                aria-pressed={isSelected}
                aria-label={`${prediction.hour}:00${isCurrent ? " (current hour)" : ""}`}
                onClick={() =>
                  setSelectedHour((current) => (current === prediction.hour ? null : prediction.hour))
                }
              >
                {isCurrent && <span style={styles.nowLabel}>Now</span>}
                <span style={styles.hour}>{prediction.hour}:00</span>
              </button>
            </li>
          );
        })}
      </ol>

      {selectedPrediction && <HourDetail prediction={selectedPrediction} />}
    </>
  );
}
