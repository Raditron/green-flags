import type { CSSProperties } from "react";

export function getToastStyles(): Record<"toast" | "message" | "close", CSSProperties> {
  return {
    toast: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 240,
      maxWidth: 360,
      padding: "10px 12px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.24)",
      color: "var(--text)",
      fontSize: 13,
    },
    message: {
      flex: 1,
    },
    close: {
      flexShrink: 0,
      border: "none",
      background: "transparent",
      color: "var(--text)",
      fontSize: 18,
      lineHeight: 1,
      padding: 0,
      cursor: "pointer",
      opacity: 0.7,
    },
  };
}
