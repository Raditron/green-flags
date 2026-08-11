import type { CSSProperties } from "react";

export function getSavedBeachesStyles(): Record<"title", CSSProperties> {
  return {
    title: {
      textAlign: "left",
      margin: "0 auto 16px",
      maxWidth: 900,
    },
  };
}
