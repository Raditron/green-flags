import type { CSSProperties } from "react";

export function getHourDetailStyles(): Record<"panel" | "hour" | "gloss", CSSProperties> {
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
    gloss: {
      margin: "4px 0 0",
      color: "var(--text-h)",
    },
  };
}
