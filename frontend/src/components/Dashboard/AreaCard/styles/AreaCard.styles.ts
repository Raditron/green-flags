import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";
import type { FlagColor } from "../../interfaces";

type AreaCardStyleKey =
  | "card"
  | "header"
  | "flagIcon"
  | "headerText"
  | "areaName"
  | "headline"
  | "stormBadge"
  | "sentence"
  | "distributions"
  | "stats"
  | "footer"
  | "footerLowSample";

export function getAreaCardStyles({ flagColor }: { flagColor: FlagColor }): Record<AreaCardStyleKey, CSSProperties> {
  return {
    card: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: 14,
      borderRadius: 12,
      background: "var(--surface)",
      border: "1px solid var(--border)",
    },
    header: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    },
    flagIcon: {
      flexShrink: 0,
      width: 16,
      height: 16,
      marginTop: 3,
      color: flagColorVar(flagColor),
    },
    headerText: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0,
      flex: 1,
    },
    areaName: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--text-h)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    headline: {
      fontSize: 12.5,
      fontWeight: 600,
      color: flagColorVar(flagColor),
    },
    // Compact badge, not a full banner — a grid with several Areas active at once needs to
    // stay scannable rather than every card sprouting its own full-width alert strip.
    stormBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      flexShrink: 0,
      padding: "3px 8px",
      borderRadius: 999,
      background: "color-mix(in srgb, var(--flag-red) 16%, transparent)",
      color: "var(--flag-red)",
      fontSize: 11,
      fontWeight: 700,
    },
    sentence: {
      fontSize: 12.5,
      color: "var(--text)",
      opacity: 0.85,
    },
    distributions: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    stats: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      fontSize: 12,
      color: "var(--text)",
    },
    footer: {
      margin: 0,
      fontSize: 11,
      color: "var(--text)",
      opacity: 0.75,
    },
    footerLowSample: {
      margin: 0,
      fontSize: 11,
      color: "var(--text)",
      fontStyle: "italic",
    },
  };
}
