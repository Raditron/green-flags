import type { CSSProperties } from "react";

type ReportedTodayNoticeStyleKey = "panel" | "icon" | "textCol" | "headline" | "sentence";

// Mirrors UnguardedNotice's tint recipe (border/background as a color-mix wash over the
// accent, rather than solid-filled like Verdict) but keyed to --info instead of --flag-red —
// same family, different accent, so the two never get confused for each other on screen.
export function getReportedTodayNoticeStyles(): Record<ReportedTodayNoticeStyleKey, CSSProperties> {
  return {
    panel: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 12,
      border: "1px solid color-mix(in srgb, var(--info) 45%, transparent)",
      background: "color-mix(in srgb, var(--info) 12%, transparent)",
    },
    icon: {
      flexShrink: 0,
      width: 18,
      height: 18,
      marginTop: 2,
      color: "var(--info)",
    },
    textCol: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      gap: 6,
      minWidth: 0,
    },
    headline: {
      fontSize: 14.5,
      fontWeight: 700,
      color: "var(--info)",
      lineHeight: 1.25,
      textAlign: "center",
    },
    sentence: {
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.85,
      lineHeight: 1.4,
    },
  };
}
