import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../../shared/styles/flagColor";

type ReportPromptStyleKey = "prompt" | "options";

export function getReportPromptStyles(): Record<ReportPromptStyleKey, CSSProperties> {
  return {
    prompt: {
      margin: "0 0 8px",
      color: "var(--text-h)",
      fontWeight: 600,
    },
    options: {
      display: "flex",
      gap: 8,
    },
  };
}

export function getFlagOptionStyle(submitting: boolean): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    flex: 1,
    border: "1px solid var(--border)",
    borderRadius: 6,
    background: "var(--bg)",
    color: "var(--text)",
    padding: "8px 4px",
    font: "inherit",
    fontSize: 12,
    fontWeight: 600,
    cursor: submitting ? "default" : "pointer",
    opacity: submitting ? 0.6 : 1,
  };
}

export function getFlagOptionIconStyle(flagColor: string): CSSProperties {
  return {
    width: 18,
    height: 18,
    color: flagColorVar(flagColor),
  };
}
