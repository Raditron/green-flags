import type { CSSProperties } from "react";
import type { GuardStatusVariant } from "../interfaces";

type GuardStatusBadgeStyleKey = "label" | "icon";

export function getGuardStatusBadgeStyles({
  variant,
}: {
  variant: GuardStatusVariant;
}): Record<GuardStatusBadgeStyleKey, CSSProperties> {
  const accent = variant === "unguarded" ? "var(--flag-red)" : "var(--flag-green)";

  return {
    label: {
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
      width: 14,
      height: 14,
    },
  };
}
