import type { CSSProperties } from "react";

export function getBeachListStyles(): Record<"list" | "error", CSSProperties> {
  return {
    list: {
      listStyle: "none",
      margin: "24px 0 0",
      padding: 0,
      textAlign: "left",
    },
    error: {
      color: "var(--error)",
    },
  };
}
