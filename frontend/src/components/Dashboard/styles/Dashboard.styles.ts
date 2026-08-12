import type { CSSProperties } from "react";

type DashboardStyleKey = "title" | "error" | "empty";

export function getDashboardStyles(): Record<DashboardStyleKey, CSSProperties> {
  return {
    title: {
      textAlign: "left",
      margin: "0 auto 16px",
      maxWidth: 1100,
    },
    error: {
      color: "var(--error)",
    },
    empty: {
      margin: "24px auto 0",
      maxWidth: 900,
      color: "var(--text)",
    },
  };
}
