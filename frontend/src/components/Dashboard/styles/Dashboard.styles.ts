import type { CSSProperties } from "react";

type DashboardStyleKey = "title" | "grid" | "error" | "empty";

export function getDashboardStyles(): Record<DashboardStyleKey, CSSProperties> {
  return {
    title: {
      textAlign: "left",
      margin: "0 auto 16px",
      maxWidth: 1100,
    },
    grid: {
      listStyle: "none",
      margin: "20px auto 0",
      padding: 0,
      width: "100%",
      maxWidth: 1100,
      display: "grid",
      // Comfortably holds anywhere from 1 to all 13 Areas — columns wrap on their own rather
      // than a fixed column count that would look sparse on a light day or cramped on a full one.
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 16,
      textAlign: "left",
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
