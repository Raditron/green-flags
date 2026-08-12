import { useState } from "react";
import { FaFlag } from "react-icons/fa6";
import type { FlagColor } from "../../../../shared/types/Beach";
import {
  getReportPromptStyles,
  getFlagOptionStyle,
  getFlagOptionSwatchStyle,
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
  const [hovered, setHovered] = useState<FlagColor | null>(null);
  const iconStyle = getFlagOptionIconStyle();

  return (
    <div>
      <p style={styles.prompt}>Think this flag is wrong? Vote below.</p>
      <div style={styles.options}>
        {OPTIONS.map(({ flagColor, label }) => (
          <button
            key={flagColor}
            type="button"
            style={getFlagOptionStyle(
              flagColor,
              hovered === flagColor,
              submitting,
            )}
            disabled={submitting}
            onClick={() => onPick(flagColor)}
            onMouseEnter={() => setHovered(flagColor)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={getFlagOptionSwatchStyle(flagColor)}>
              <FaFlag style={iconStyle} />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
