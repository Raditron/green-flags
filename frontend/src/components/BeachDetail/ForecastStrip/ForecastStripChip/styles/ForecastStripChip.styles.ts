import type { CSSProperties } from "react";

export type ForecastStripChipState = "pending" | "resolved" | "failed";

type ForecastStripChipStyleKey = "button" | "dot" | "label" | "date";

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
      justifyContent: "center",
      gap: 8,
      width: "100%",
      border: `1px solid ${selected ? "var(--text-h)" : "var(--border)"}`,
      borderRadius: 12,
      padding: "14px 8px",
      font: "inherit",
      fontSize: 14,
      color: "var(--text)",
      // --surface, not --border, for the selected fill: --border is a light "nepal" blue in
      // both themes (chosen to stay visible as an outline against a dark background), so
      // using it as a solid fill just reproduces the light-mode look in dark mode. --surface
      // is the token that's actually themed per-mode (near-white in light, dark navy in dark).
      background: selected ? "var(--surface)" : "transparent",
      cursor: state === "failed" ? "default" : "pointer",
      opacity: state === "failed" ? 0.5 : 1,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "var(--border)",
      flexShrink: 0,
    },
    label: {
      whiteSpace: "nowrap",
    },
    // Smaller, muted, and pulled up out of the button's flex gap so it reads as a caption
    // underneath the day label rather than a peer of equal visual weight.
    date: {
      whiteSpace: "nowrap",
      fontSize: 11,
      opacity: 0.7,
      marginTop: -4,
    },
  };
}
