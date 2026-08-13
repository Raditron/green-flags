import type { CSSProperties } from "react";

type DayOutlookStyleKey = "status" | "error" | "worstAround" | "detailRow";

export function getDayOutlookStyles(): Record<DayOutlookStyleKey, CSSProperties> {
  return {
    status: {
      margin: 0,
      fontSize: 14,
      color: "var(--text)",
      opacity: 0.8,
    },
    error: {
      margin: 0,
      fontSize: 14,
      color: "#b91c1c",
    },
    // Sits directly under Verdict's flag panel, same idea as Timeline's "Updated HH:MM" caption —
    // the one piece of "why" a future day needs that Verdict's own copy doesn't already say.
    worstAround: {
      margin: "4px 0 0",
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.85,
      textAlign: "center",
    },
    detailRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      alignItems: "stretch",
    },
  };
}
