import type { CSSProperties } from "react";

type UnguardedNoticeStyleKey = "panel" | "icon" | "textCol" | "headline" | "sentence";

// Sits directly under Verdict's flag-color panel. Deliberately tinted rather than
// solid-filled like Verdict — same panel shape and text hierarchy so it reads as
// "part of the same family", but the lighter treatment keeps it from being mistaken
// for an actual red-flag reading when both are on screen at once.
export function getUnguardedNoticeStyles(): Record<UnguardedNoticeStyleKey, CSSProperties> {
  return {
    panel: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 12,
      border: "1px solid color-mix(in srgb, var(--flag-red) 45%, transparent)",
      background: "color-mix(in srgb, var(--flag-red) 12%, transparent)",
    },
    icon: {
      flexShrink: 0,
      width: 18,
      height: 18,
      marginTop: 2,
      color: "var(--flag-red)",
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
      color: "var(--flag-red)",
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
