import type { CSSProperties } from "react";

// Shared by the beach card's distance-away label and the filter bar's "near you" hint: both are
// purely informational asides (like the confidence meter, see ADR 0004) that must read as neutral
// rather than borrowing a flag color, so they stay visually distinct from safety signals.
export const neutralHintTextStyle: CSSProperties = {
  fontSize: 12.5,
  color: "var(--text)",
};
