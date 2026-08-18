import type { CSSProperties } from "react";

type ClearFiltersStyleKey = "button" | "icon";

// Matches FieldSelect/AreaSelect's trigger pill (border + surface fill) rather than a ghost
// button, so "Clear filters" reads as one more control in the row instead of a stray text link.
// The border-only hover echoes BeachListCard's "isRaised" treatment for a bit of affordance.
export function getClearFiltersStyles({
  isHovered,
}: {
  isHovered: boolean;
}): Record<ClearFiltersStyleKey, CSSProperties> {
  return {
    button: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 12px",
      borderRadius: 999,
      border: `1px solid ${isHovered ? "var(--text-h)" : "var(--border)"}`,
      background: "var(--surface)",
      color: "var(--text)",
      font: "inherit",
      fontSize: 14,
      cursor: "pointer",
      transition: "border-color 0.12s ease",
    },
    icon: {
      width: 14,
      height: 14,
      color: "var(--text)",
    },
  };
}
