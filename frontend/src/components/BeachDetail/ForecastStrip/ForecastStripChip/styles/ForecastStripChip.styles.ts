import type { CSSProperties } from "react";

export type ForecastStripChipState = "pending" | "resolved" | "failed";

type ForecastStripChipStyleKey = "button" | "dot" | "label";

interface ForecastStripChipStyleArgs {
  state: ForecastStripChipState;
  selected: boolean;
}

// Three visually distinct looks per the chip states this represents: pending (neutral, faint
// pulse-free placeholder dot), resolved (full-strength, flag-colored dot — set by the caller,
// see ForecastStripChip.tsx), failed (muted/disabled, unclickable — there's no day to view yet).
export function getForecastStripChipStyles({
  state,
  selected,
}: ForecastStripChipStyleArgs): Record<ForecastStripChipStyleKey, CSSProperties> {
  return {
    button: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      border: `1px solid ${selected ? "var(--text-h)" : "var(--border)"}`,
      borderRadius: 8,
      padding: "8px 12px",
      minWidth: 56,
      font: "inherit",
      fontSize: 12,
      color: "var(--text)",
      background: selected ? "var(--border)" : "transparent",
      cursor: state === "failed" ? "default" : "pointer",
      opacity: state === "failed" ? 0.5 : 1,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--border)",
      flexShrink: 0,
    },
    label: {
      whiteSpace: "nowrap",
    },
  };
}
