import type { CSSProperties } from "react";

type ForecastStripStyleKey = "list" | "item";

export function getForecastStripStyles(): Record<ForecastStripStyleKey, CSSProperties> {
  return {
    list: {
      listStyle: "none",
      // No bottom margin — the parent `badges` column already applies a 16px flex gap
      // between its children (see BeachDetail.styles.ts); adding margin here on top of
      // that gap was doubling the space below the strip to 32px.
      margin: 0,
      padding: 0,
      display: "flex",
      gap: 8,
      overflowX: "auto",
    },
    // flex: 1 lets each chip grow to fill the row evenly (rather than space-between, which
    // would spread out fixed-size chips and leave them looking small) — minWidth: 0 lets a
    // chip shrink below its content's natural width if the row gets too narrow to fit all 7.
    item: {
      flex: 1,
      minWidth: 0,
    },
  };
}
