import type { FlagColor } from "../../interfaces";
import styles from "./styles/FlagColorPicker.module.css";

interface FlagColorPickerProps {
  submitting: boolean;
  onPick: (flagColor: FlagColor) => void;
  onClose: () => void;
}

const OPTIONS: { flagColor: FlagColor; label: string }[] = [
  { flagColor: "green", label: "Green" },
  { flagColor: "yellow", label: "Yellow" },
  { flagColor: "red", label: "Red" },
];

export function FlagColorPicker({ submitting, onPick, onClose }: FlagColorPickerProps) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.picker} onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Report the flag color">
        <p className={styles.prompt}>What color is the flag right now?</p>
        <div className={styles.options}>
          {OPTIONS.map(({ flagColor, label }) => (
            <button
              key={flagColor}
              type="button"
              className={styles.option}
              data-flag={flagColor}
              disabled={submitting}
              onClick={() => onPick(flagColor)}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" className={styles.close} onClick={onClose} aria-label="Close" disabled={submitting}>
          ×
        </button>
      </div>
    </div>
  );
}
