import type { CSSProperties } from "react";

type ReportFlagButtonStyleKey = "confirmation" | "error";

// This component no longer renders a button of its own — these two styles are for the
// confirmation/error content it swaps into the shared report toast once a submission resolves.
export function getReportFlagButtonStyles(): Record<ReportFlagButtonStyleKey, CSSProperties> {
  return {
    confirmation: {
      margin: 0,
      color: "var(--flag-green)",
    },
    error: {
      margin: 0,
      color: "var(--error)",
    },
  };
}
