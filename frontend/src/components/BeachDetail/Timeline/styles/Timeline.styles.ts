import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";

type TimelineStyleKey = "strip" | "segmentItem" | "nowLabel" | "hour";

export function getTimelineStyles({
  desaturated,
}: {
  desaturated: boolean;
}): Record<TimelineStyleKey, CSSProperties> {
  return {
    strip: {
      display: "flex",
      gap: 4,
      margin: "16px 0 0",
      padding: 0,
      listStyle: "none",
      overflowX: "auto",
      filter: desaturated ? "grayscale(0.75) opacity(0.65)" : "none",
    },
    segmentItem: {
      flex: "1 0 44px",
    },
    nowLabel: {
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      opacity: 0.9,
    },
    hour: {
      whiteSpace: "nowrap",
    },
  };
}

export function getSegmentStyle({
  flagColor,
  selected,
  current,
}: {
  flagColor: string;
  selected: boolean;
  current: boolean;
}): CSSProperties {
  return {
    width: "100%",
    height: 56,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    font: "inherit",
    cursor: "pointer",
    background: flagColorVar(flagColor),
    outline: selected ? "3px solid var(--text-h)" : "none",
    outlineOffset: selected ? -3 : 0,
    boxShadow: current ? "0 0 0 2px #fff inset" : "none",
  };
}
