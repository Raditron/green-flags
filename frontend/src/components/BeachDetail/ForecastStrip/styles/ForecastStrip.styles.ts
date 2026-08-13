import type { CSSProperties } from "react";

type ForecastStripStyleKey = "list";

export function getForecastStripStyles(): Record<ForecastStripStyleKey, CSSProperties> {
  return {
    list: {
      listStyle: "none",
      margin: "0 0 16px",
      padding: 0,
      display: "flex",
      gap: 8,
      overflowX: "auto",
    },
  };
}
