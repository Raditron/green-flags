import type { CSSProperties } from "react";

type HourDetailStyleKey = "panel" | "hour" | "meterRow" | "meterTrack" | "meterFill" | "percent" | "caption";

export function getHourDetailStyles(): Record<HourDetailStyleKey, CSSProperties> {
  return {
    panel: {
      marginTop: 12,
      padding: "12px 16px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
    },
    hour: {
      fontWeight: 600,
      color: "var(--text-h)",
    },
    meterRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 8,
    },
    meterTrack: {
      flex: 1,
      height: 8,
      borderRadius: 999,
      background: "var(--border)",
      overflow: "hidden",
    },
    // Neutral blue rather than the flag palette — this measures how much data backs
    // the prediction, not whether the water is safe, so it deliberately reads as a
    // different signal than the red/yellow/green flag it sits next to (ADR-0004).
    meterFill: {
      height: "100%",
      borderRadius: 999,
      background: "var(--text)",
      transition: "width 0.2s ease",
    },
    percent: {
      minWidth: 34,
      textAlign: "right",
      fontWeight: 700,
      fontSize: 13,
      color: "var(--text-h)",
    },
    caption: {
      margin: "6px 0 0",
      fontSize: 12.5,
      color: "var(--text)",
      opacity: 0.75,
    },
  };
}
