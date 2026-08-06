import type { FlagColor } from "../../interfaces";
import { getFlagColorPickerStyles, getFlagColorOptionStyle } from "./styles/FlagColorPicker.styles";

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
  const styles = getFlagColorPickerStyles();

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.picker} onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Report the flag color">
        <p style={styles.prompt}>What color is the flag right now?</p>
        <div style={styles.options}>
          {OPTIONS.map(({ flagColor, label }) => (
            <button
              key={flagColor}
              type="button"
              style={getFlagColorOptionStyle(flagColor, submitting)}
              disabled={submitting}
              onClick={() => onPick(flagColor)}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" style={styles.close} onClick={onClose} aria-label="Close" disabled={submitting}>
          ×
        </button>
      </div>
    </div>
  );
}
