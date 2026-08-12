import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../../shared/styles/flagColor";
import type { FlagColor } from "../../../interfaces";

type VerdictStyleKey = "panel" | "icon" | "textCol" | "headline" | "sentence" | "caution";

// Full-width and rendered as the first thing under the hero image (see Timeline.tsx) —
// this is meant to be the one thing a visitor reads before anything else on the page,
// so it gets the flag-color treatment and the boldest text here. The time/confidence/
// conditions row below it is all supporting "why", sized and weighted accordingly.
export function getVerdictStyles({
  flagColor,
  desaturated,
}: {
  flagColor: FlagColor;
  desaturated: boolean;
}): Record<VerdictStyleKey, CSSProperties> {
  return {
    panel: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      padding: "18px 20px",
      borderRadius: 12,
      background: flagColorVar(flagColor),
      color: "#fff",
      filter: desaturated ? "grayscale(0.75) opacity(0.65)" : "none",
      // Same transition length as Timeline's own card — flag color flips read as a
      // state change, not a decorative animation.
      transition: "background 0.2s ease",
    },
    icon: {
      position: "absolute",
      top: 18,
      left: 20,
      width: 22,
      height: 22,
      opacity: 0.9,
    },
    textCol: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      minWidth: 0,
      textAlign: "center",
    },
    headline: {
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
    },
    sentence: {
      fontSize: 14.5,
      opacity: 0.92,
    },
    caution: {
      fontSize: 13,
      fontWeight: 700,
      marginTop: 2,
    },
  };
}
