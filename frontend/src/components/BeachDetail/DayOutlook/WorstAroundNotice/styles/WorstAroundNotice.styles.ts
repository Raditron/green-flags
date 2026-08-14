import type { CSSProperties } from "react";

type WorstAroundNoticeStyleKey = "panel" | "icon" | "sentence";

// Same tint recipe as ReportedTodayNotice/UnguardedNotice — color-mix wash over an accent
// rather than solid-filled — keyed to --info like ReportedTodayNotice since this, too, is
// explanatory rather than a warning. Single-line variant of that panel shape: no separate
// headline, just an icon and the one sentence this notice exists to say.
export function getWorstAroundNoticeStyles(): Record<WorstAroundNoticeStyleKey, CSSProperties> {
  return {
    panel: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "10px 16px",
      borderRadius: 12,
      border: "1px solid color-mix(in srgb, var(--info) 45%, transparent)",
      background: "color-mix(in srgb, var(--info) 12%, transparent)",
    },
    icon: {
      flexShrink: 0,
      width: 16,
      height: 16,
      color: "var(--info)",
    },
    sentence: {
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.85,
      lineHeight: 1.4,
    },
  };
}
