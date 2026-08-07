import type { CSSProperties } from "react";

export function getToastViewportStyles(): Record<"viewport", CSSProperties> {
  return {
    viewport: {
      position: "fixed",
      bottom: 20,
      right: 20,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      zIndex: 1000,
    },
  };
}
