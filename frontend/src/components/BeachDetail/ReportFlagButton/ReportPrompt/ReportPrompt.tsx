import { FaFlag } from "react-icons/fa6";
import type { FlagColor } from "../../../../shared/types/Beach";
import {
  getReportPromptStyles,
  getFlagOptionStyle,
  getFlagOptionIconStyle,
} from "./styles/ReportPrompt.styles";

const OPTIONS: { flagColor: FlagColor; label: string }[] = [
  { flagColor: "green", label: "Green" },
  { flagColor: "yellow", label: "Yellow" },
  { flagColor: "red", label: "Red" },
];

export function ReportPrompt({
  submitting,
  onPick,
}: {
  submitting: boolean;
  onPick: (flagColor: FlagColor) => void;
}) {
  const styles = getReportPromptStyles();

  return (
    <div>
      <p style={styles.prompt}>What color is the flag right now?</p>
      <div style={styles.options}>
        {OPTIONS.map(({ flagColor, label }) => (
          <button
            key={flagColor}
            type="button"
            style={getFlagOptionStyle(submitting)}
            disabled={submitting}
            onClick={() => onPick(flagColor)}
          >
            <FaFlag style={getFlagOptionIconStyle(flagColor)} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
