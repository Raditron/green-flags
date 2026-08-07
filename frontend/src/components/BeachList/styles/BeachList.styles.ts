import type { CSSProperties } from "react";

export function getBeachListStyles(): Record<"list" | "item" | "error" | "empty", CSSProperties> {
  return {
    list: {
      listStyle: "none",
      margin: "24px auto 0",
      padding: 0,
      width: "100%",
      // Caps card width so the grid can't stretch to fill a wide viewport —
      // without this, two columns on a large screen blow the cards up far
      // past the size they were designed at.
      maxWidth: 900,
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 20,
      textAlign: "left",
    },
    item: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
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
