import { useState } from "react";
import type { HourlyPrediction } from "../interfaces";
import { HourDetail } from "./HourDetail/HourDetail";
import { TimePicker } from "./TimePicker/TimePicker";
import { useLiveClock } from "./hooks/useLiveClock";
import { getTimelineStyles } from "./styles/Timeline.styles";

interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
  updatedAt?: string;
}

export function Timeline({
  hourlyPredictions,
  desaturated = false,
  currentHour = null,
  updatedAt,
}: TimelineProps) {
  // null = still tracking "now" as the live clock ticks; the moment the visitor manually
  // picks an hour from the popup, this locks in and stops following the clock.
  const [manualHour, setManualHour] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timeHovered, setTimeHovered] = useState(false);
  const liveClock = useLiveClock();

  // currentHour is null outside the lifeguard window (see legalWindow.ts), in which case
  // there's no "now" to track at all — same off-hours behavior the old strip had.
  const trackedHour = currentHour !== null ? liveClock.hour : null;
  const selectedHour = manualHour ?? trackedHour;
  const selectedPrediction = hourlyPredictions.find(
    prediction => prediction.hour === selectedHour,
  );
  const styles = getTimelineStyles({
    desaturated,
    flagColor: selectedPrediction?.flagColor,
    timeHovered,
  });

  return (
    <>
      <div style={styles.card}>
        <span style={styles.liveClock}>{liveClock.label}</span>

        <button
          type="button"
          style={styles.selectedTime}
          onClick={() => setPickerOpen(true)}
          onMouseEnter={() => setTimeHovered(true)}
          onMouseLeave={() => setTimeHovered(false)}
          aria-haspopup="dialog"
          aria-label="Choose prediction hour"
        >
          {selectedHour !== null
            ? `${String(selectedHour).padStart(2, "0")}:00`
            : "Select hour"}
        </button>

        {updatedAt && (
          <span style={styles.updatedAt}>
            Updated{" "}
            {new Date(updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {selectedPrediction && <HourDetail prediction={selectedPrediction} />}

      {pickerOpen && (
        <TimePicker
          hourlyPredictions={hourlyPredictions}
          selectedHour={selectedHour}
          currentHour={trackedHour}
          onPick={hour => {
            setManualHour(hour);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
