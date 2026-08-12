import { flagColorVar } from "../../../../shared/styles/flagColor";
import type { TimePickerProps } from "./interfaces";
import { getTimePickerStyles, getTimePickerRowStyle } from "./styles/TimePicker.styles";

// Backdrop + centered dialog convention, consistent with the other modal on this page
// (AuthModal).
export function TimePicker({ hourlyPredictions, selectedHour, currentHour, onPick, onClose }: TimePickerProps) {
  const styles = getTimePickerStyles();

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.picker} onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Select prediction hour">
        <p style={styles.prompt}>Choose a prediction hour</p>

        <ul style={styles.list}>
          {hourlyPredictions.map((prediction) => {
            const isSelected = prediction.hour === selectedHour;
            const isCurrent = prediction.hour === currentHour;
            return (
              <li key={prediction.hour}>
                <button
                  type="button"
                  style={getTimePickerRowStyle({ selected: isSelected })}
                  aria-pressed={isSelected}
                  onClick={() => onPick(prediction.hour)}
                >
                  <span style={{ ...styles.dot, background: flagColorVar(prediction.flagColor) }} aria-hidden="true" />
                  <span style={styles.hourLabel}>{String(prediction.hour).padStart(2, "0")}:00</span>
                  {isCurrent && <span style={styles.nowTag}>Now</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <button type="button" style={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}
