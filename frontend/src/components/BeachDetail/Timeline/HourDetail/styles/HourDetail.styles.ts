import type { CSSProperties } from "react";

type HourDetailStyleKey = "panel" | "hour" | "ringWrap" | "ringTrack" | "ringProgress" | "percent" | "caption";

export function getHourDetailStyles(): Record<HourDetailStyleKey, CSSProperties> {
  return {
    panel: {
      flex: "1 1 160px",
      minWidth: 160,
      padding: "12px 16px",
      borderRadius: 12,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    hour: {
      fontWeight: 600,
      color: "var(--text-h)",
    },
    ringWrap: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    ringTrack: {
      opacity: 0.25,
    },
    ringProgress: {
      transition: "stroke-dashoffset 0.2s ease",
    },
    percent: {
      position: "absolute",
      fontWeight: 700,
      fontSize: 16,
      color: "var(--text-h)",
    },
    caption: {
      margin: "8px 0 0",
      fontSize: 12.5,
      color: "var(--text)",
      opacity: 0.75,
    },
  };
}
