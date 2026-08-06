import type { CSSProperties } from "react";

type BeachDetailStyleKey = "back" | "error" | "meta" | "refreshing" | "offWindow";

export function getBeachDetailStyles({
  backHovered,
}: {
  backHovered: boolean;
}): Record<BeachDetailStyleKey, CSSProperties> {
  return {
    back: {
      display: "inline-block",
      marginBottom: 8,
      color: "var(--text)",
      fontSize: 14,
      textDecoration: backHovered ? "underline" : "none",
    },
    error: {
      color: "#b91c1c",
    },
    meta: {
      margin: "4px 0 0",
      fontSize: 13,
      color: "var(--text)",
    },
    refreshing: {
      marginLeft: 6,
      color: "var(--text)",
      opacity: 0.7,
    },
    offWindow: {
      margin: "12px 0 0",
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.8,
    },
  };
}
