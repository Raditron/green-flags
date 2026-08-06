import type { CSSProperties } from "react";

type ReportFlagButtonStyleKey = "container" | "button" | "reason" | "confirmation" | "error";

export function getReportFlagButtonStyles({
  disabled,
}: {
  disabled: boolean;
}): Record<ReportFlagButtonStyleKey, CSSProperties> {
  return {
    container: {
      margin: "16px 0 0",
    },
    button: {
      border: "none",
      borderRadius: 6,
      background: "var(--text-h)",
      color: "var(--bg)",
      padding: "10px 16px",
      font: "inherit",
      fontWeight: 600,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.5 : 1,
    },
    reason: {
      margin: "6px 0 0",
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.8,
    },
    confirmation: {
      margin: "6px 0 0",
      fontSize: 13,
      color: "var(--flag-green)",
    },
    error: {
      margin: "6px 0 0",
      fontSize: 13,
      color: "var(--error)",
    },
  };
}
