import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";

type BeachListCardStyleKey =
  | "row"
  | "link"
  | "pin"
  | "name"
  | "flagBadge"
  | "flagDot"
  | "confidence";

export function getBeachListCardStyles({
  linkHovered,
}: {
  linkHovered: boolean;
}): Record<BeachListCardStyleKey, CSSProperties> {
  return {
    row: {
      borderBottom: "1px solid var(--border)",
    },
    link: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 4px",
      color: "inherit",
      textDecoration: "none",
    },
    pin: {
      flexShrink: 0,
      borderRadius: 8,
      objectFit: "cover",
    },
    name: {
      fontSize: 15,
      color: "var(--text-h)",
      textDecoration: linkHovered ? "underline" : "none",
    },
    flagBadge: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginLeft: "auto",
    },
    flagDot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      flexShrink: 0,
    },
    confidence: {
      fontSize: 13,
      color: "var(--text)",
    },
  };
}

export function getFlagDotStyle(flagColor: string | undefined): CSSProperties {
  return { background: flagColorVar(flagColor) };
}
