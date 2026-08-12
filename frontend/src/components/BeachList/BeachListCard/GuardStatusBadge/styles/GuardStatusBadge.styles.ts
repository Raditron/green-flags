import type { CSSProperties } from "react";
import type { GuardStatusVariant } from "../interfaces";

type GuardStatusBadgeStyleKey = "label" | "icon" | "tooltip";

export function getGuardStatusBadgeStyles({
  variant,
  isHovered,
}: {
  variant: GuardStatusVariant;
  isHovered: boolean;
}): Record<GuardStatusBadgeStyleKey, CSSProperties> {
  const accent = variant === "unguarded" ? "var(--flag-red)" : "var(--flag-green)";

  return {
    label: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: `1px solid color-mix(in srgb, ${accent} 50%, transparent)`,
      borderRadius: 999,
      background: `color-mix(in srgb, ${accent} 14%, transparent)`,
      color: accent,
      cursor: "help",
      padding: 5,
    },
    icon: {
      width: 12,
      height: 12,
    },
    tooltip: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      zIndex: 1,
      width: 200,
      padding: "8px 10px",
      borderRadius: 6,
      background: "var(--text-h)",
      color: "var(--surface)",
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.35,
      opacity: isHovered ? 1 : 0,
      pointerEvents: "none",
      transform: isHovered ? "translateY(0)" : "translateY(-2px)",
      transition: "opacity 0.12s ease, transform 0.12s ease",
      visibility: isHovered ? "visible" : "hidden",
      whiteSpace: "normal",
    },
  };
}
