import type { CSSProperties } from "react";

type SeaConditionsStyleKey = "stack" | "panel" | "icon" | "textCol" | "label" | "caption";

// Wind and sea each get their own card now, stacked vertically inside one wrapper —
// `stack` is the single flex item Timeline's row sees (alongside the time and
// confidence cards); `panel` is applied to each of the two cards inside it.
export function getSeaConditionsStyles(): Record<SeaConditionsStyleKey, CSSProperties> {
  return {
    stack: {
      flex: "1 1 220px",
      minWidth: 220,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    panel: {
      flex: "1 1 0%",
      minWidth: 0,
      padding: "12px 16px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    },
    icon: {
      flexShrink: 0,
      marginTop: 2,
      color: "var(--text)",
      opacity: 0.75,
    },
    textCol: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text-h)",
      textTransform: "capitalize",
    },
    caption: {
      fontSize: 12.5,
      color: "var(--text)",
      opacity: 0.75,
    },
  };
}
