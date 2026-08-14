import type { CSSProperties } from "react";

type DayOutlookStyleKey = "status" | "error" | "detailRow";

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
    detailRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      alignItems: "stretch",
    },
  };
}
