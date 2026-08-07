import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";
import type { FlagColor } from "../../interfaces";

type TimelineStyleKey = "card" | "liveClock" | "selectedTime" | "updatedAt";

export function getTimelineStyles({
  desaturated,
  flagColor,
  timeHovered,
}: {
  desaturated: boolean;
  flagColor?: FlagColor;
  timeHovered: boolean;
}): Record<TimelineStyleKey, CSSProperties> {
  // Only tint the card once an hour is actually selected — with nothing selected yet
  // (e.g. outside the lifeguard window with no manual pick), flagColorVar's neutral
  // fallback reads too light for white text, so fall back to the theme's own surface.
  const hasFlagColor = Boolean(flagColor);
  const textColor = hasFlagColor ? "#fff" : "var(--text-h)";

  return {
    card: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "20px 16px",
      borderRadius: 12,
      background: hasFlagColor ? flagColorVar(flagColor) : "var(--surface)",
      border: "1px solid var(--border)",
      filter: desaturated ? "grayscale(0.75) opacity(0.65)" : "none",
      transition: "background 0.2s ease",
    },
    liveClock: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: textColor,
      opacity: 0.85,
    },
    selectedTime: {
      font: "inherit",
      fontSize: 36,
      fontWeight: 800,
      color: textColor,
      background: timeHovered ? "rgba(127, 127, 127, 0.15)" : "none",
      border: "none",
      cursor: "pointer",
      padding: "4px 14px",
      borderRadius: 8,
      lineHeight: 1.1,
      transition: "background 0.15s ease",
    },
    updatedAt: {
      fontSize: 11,
      color: textColor,
      opacity: 0.75,
    },
  };
}
