import type { CSSProperties } from "react";

export function getToastViewportStyles(): Record<"viewport", CSSProperties> {
  return {
    viewport: {
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      zIndex: 1000,
    },
  };
}
