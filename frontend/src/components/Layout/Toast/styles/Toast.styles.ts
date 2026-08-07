import type { CSSProperties } from "react";

export function getToastStyles(): Record<"toast" | "content" | "close", CSSProperties> {
  return {
    toast: {
      display: "flex",
      // flex-start rather than center: interactive content (a prompt plus a row of option
      // buttons) stacks taller than a single line of text, and top-aligning the close button
      // against it reads better than vertically centering it against the whole block.
      alignItems: "flex-start",
      gap: 10,
      minWidth: 240,
      // Widened from the original 360 to comfortably fit three flag-icon+label option buttons
      // side by side without wrapping.
      maxWidth: 420,
      padding: "10px 12px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.24)",
      color: "var(--text)",
      fontSize: 13,
    },
    content: {
      flex: 1,
      minWidth: 0,
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
