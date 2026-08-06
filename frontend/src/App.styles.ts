import type { CSSProperties } from "react";

export function getAppStyles(): Record<"app", CSSProperties> {
  return {
    app: {
      maxWidth: 640,
      margin: "0 auto",
      padding: "48px 24px",
      textAlign: "center",
      backgroundColor: "var(--snow-drift)",
    },
  };
}
