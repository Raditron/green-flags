import type { CSSProperties } from "react";

type ReportFlagPanelStyleKey = "panel" | "error";

// Own neutral surface card, sitting as a sibling below Verdict on the page (rather than an
// inset "hole" cut into Verdict's solid flag-color panel) — see Timeline.tsx. Un-tinted since
// it no longer needs to read against a saturated background, just the page behind it.
export function getReportFlagPanelStyles(): Record<ReportFlagPanelStyleKey, CSSProperties> {
  return {
    panel: {
      padding: "16px 16px 18px",
      borderRadius: 12,
      background: "var(--surface)",
      border: "1px solid var(--border)",
    },
    error: {
      margin: "0 0 12px",
      color: "var(--error)",
      fontSize: 13,
      textAlign: "center",
    },
  };
}
